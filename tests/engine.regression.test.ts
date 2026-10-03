/**
 * Story Engine V2 – regression tests (no network, no live model).
 * Run:  npm run test:engine
 *
 * What these tests can prove without a model: the V1 template path is gone,
 * no request is matched to a prepared story, every request takes the same V2
 * pipeline, the critic rejects superficial personalisation, names are
 * capitalised, and the number of model calls stays bounded.
 * What they cannot prove: the creative quality of a live model's stories –
 * that needs a configured provider (see README).
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runStoryEngine } from '../src/services/storyEngine/storyEngine';
import { localCritique, requestElements } from '../src/services/storyEngine/critic';
import { createStory, finalizeText, NoStoryProvider, toEngineRequest } from '../src/services/storyService';
import { FIXTURES } from '../src/services/storyEngine/demo/fixtures';
import type { LlmProvider } from '../src/services/storyEngine/provider';
import type { StageName } from '../src/services/storyEngine/prompts';
import type { StoryRequest } from '../src/types/story';
import { OLD_V1_GEORGE, RED_CAR_STORY } from './mockStories';

let passed = 0;
async function test(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}\n    ${(err as Error).message}`);
    process.exitCode = 1;
  }
}

const george: StoryRequest = {
  childAge: 6, childName: 'george', language: 'en', interests: [], interestLabels: [],
  interestsText: 'red car', storyMood: 'surprise', voiceId: 'neutral',
};

/** Scripted provider: returns a plan built from the actual request, then queued writer outputs. */
function mockProvider(writerQueue: string[], opts: { reviewPass?: boolean } = {}) {
  const calls: Array<{ stage: StageName; user: string }> = [];
  const provider: LlmProvider = {
    name: 'mock',
    async generateText() { return ''; },
    async generateStructured(stage, user, validate) {
      calls.push({ stage, user });
      const req = JSON.parse(user).request ?? {};
      const subject: string = req.childsRequest ?? 'the idea';
      if (stage === 'plan') {
        return validate({
          interpretation: { explicitRequest: subject, coreElements: [subject], nonNegotiables: [subject], mostInterestingPotential: `what is odd about ${subject}`, naturalScale: 'small' },
          candidates: [
            { id: 'a', premise: `${subject} behaves strangely one Saturday and a bird is the reason`, centralDevice: 'hidden nest explains odd behaviour', scale: 'small' },
            { id: 'b', premise: `a race nobody expected, involving ${subject}`, centralDevice: 'unlikely competition', scale: 'medium' },
            { id: 'c', premise: `${subject} goes missing from the street at night`, centralDevice: 'clue trail mystery', scale: 'small' },
          ],
          diversityCheck: { genuinelyDifferent: true },
          selection: { candidateId: 'a', reasoning: 'smallest true scale' },
          architecture: { corePremise: `${subject} at the heart of a small mystery`, storyForm: 'small realistic mystery', protagonist: { identity: 'child' } },
          characters: [{ name: 'Grandpa', personality: 'dry, practical' }],
          guidance: { included: false },
        });
      }
      if (stage === 'writer') {
        const text = writerQueue.length > 1 ? writerQueue.shift()! : writerQueue[0];
        return validate({ title: 'Story', text, summary: 's', coverScene: 'c' });
      }
      if (stage === 'review') {
        return validate({
          critique: opts.reviewPass === false ? { status: 'rewrite', problemLayer: 'writer', issues: ['flat'] } : { status: 'pass', problemLayer: null, issues: [] },
          fingerprint: { genre: 'small mystery', scale: 'small', settingType: 'driveway', centralDevice: 'hidden nest', characterTypes: ['grandparent', 'sparrow'] },
        });
      }
      throw new Error(`unexpected stage ${stage}`);
    },
  };
  return { provider, calls };
}

console.log('\nStory Engine V2 – regression');

await test('V1 template engine is removed from the codebase', () => {
  const root = join(import.meta.dirname, '..', 'src');
  assert.equal(existsSync(join(root, 'services/demo/demoStoryEngine.ts')), false);
  assert.equal(existsSync(join(root, 'services/demo/packs')), false);
  const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  for (const f of walk(root).filter((f) => /\.(ts|tsx)$/.test(f))) {
    const src = readFileSync(f, 'utf8');
    assert.ok(!/demoStoryEngine|matchFixture|generateDemoStory/.test(src), `legacy reference in ${f}`);
  }
});

await test('George / 6 / "red car" / EN without provider → honest NoStoryProvider, never a template', async () => {
  await assert.rejects(() => createStory(george), (e: unknown) => e instanceof NoStoryProvider);
});

await test('George request reaches V2 unchanged and the name is capitalised', () => {
  const r = toEngineRequest(george);
  assert.equal(r.child?.firstName, 'George');
  assert.equal(r.request, 'red car');
  assert.deepEqual(requestElements(r.request), ['red car']);
});

await test('George / red car: V1-style story is rejected, re-planned, and the red car drives the final story', async () => {
  const { provider, calls } = mockProvider([OLD_V1_GEORGE.replace(/george/g, '{{HERO}}'), RED_CAR_STORY]);
  const req = { ...toEngineRequest(george), child: { firstName: '{{HERO}}', age: 6 } };
  const result = await runStoryEngine(req, provider, { debug: true });
  const first = result.debug!.critiques[0];
  assert.equal(first.status, 'rewrite');
  assert.equal(first.problemLayer, 'concept');
  assert.ok(first.issues.some((i) => /V1 template/.test(i)), 'legacy template detected');
  assert.ok(first.issues.some((i) => /injected/.test(i)), 'interest injection detected');
  assert.deepEqual(calls.map((c) => c.stage), ['plan', 'writer', 'plan', 'writer', 'review'], 'concept failure returns to PLAN, bounded');

  const text = finalizeText(result.story.text, 'George');
  const paras = text.split(/\n\s*\n/);
  const withCar = paras.filter((p) => /red car/i.test(p)).length;
  assert.ok(withCar >= 3, `red car in ${withCar} paragraphs`);
  assert.ok(/red car/i.test(paras[0]), 'red car is part of the premise from the first paragraph');
  assert.ok(!/mosslight|lulu/i.test(text), 'no Mosslight / Lulu');
  assert.ok(!/apple tree|magic(al)? door|tiny door/i.test(text), 'no apple tree / magic door');
  assert.ok(!/thought about (all )?the things|heart beat faster/i.test(text), 'no interest-injection sentence');
  assert.ok(text.includes('George') && !/\bgeorge\b/.test(text), 'George capitalised');
});

await test('SWAP TEST: the same red-car story fails for the request "dinosaur"', () => {
  const swapped = localCritique({ title: 't', text: finalizeText(RED_CAR_STORY, 'George') }, { req: { language: 'en', request: 'dinosaur', child: { age: 6 } } });
  assert.equal(swapped.status, 'rewrite');
  assert.ok(swapped.issues.some((i) => /swap test failed/.test(i)));
  const original = localCritique({ title: 't', text: finalizeText(RED_CAR_STORY, 'George') }, { req: { language: 'en', request: 'red car', child: { age: 6 } } });
  assert.equal(original.status, 'pass', original.issues.join('; '));
});

await test('The old V1 George output fails the local critic on every count', () => {
  const c = localCritique({ title: 'George, Lulu and the Mosslight Tree Village', text: OLD_V1_GEORGE }, { req: { language: 'en', request: 'red car', child: { age: 6, firstName: 'George' } } });
  assert.equal(c.status, 'rewrite');
  for (const re of [/V1 template/, /injected/, /swap test/, /capitalised/]) assert.ok(c.issues.some((i) => re.test(i)), `missing ${re}`);
});

await test('Name finalisation fixes lowercase names everywhere', () => {
  assert.equal(finalizeText('{{HERO}} waved. "george!" called Grandpa.', 'George'), 'George waved. "George!" called Grandpa.');
});

await test('A passing story costs exactly 3 model calls (PLAN, WRITE, REVIEW)', async () => {
  const { provider, calls } = mockProvider([RED_CAR_STORY]);
  await runStoryEngine({ ...toEngineRequest(george), child: { firstName: '{{HERO}}', age: 6 } }, provider);
  assert.equal(calls.length, 3);
});

await test('Rewrites are bounded even if the critic never passes', async () => {
  const { provider, calls } = mockProvider([RED_CAR_STORY], { reviewPass: false });
  const r = await runStoryEngine({ ...toEngineRequest(george), child: { firstName: '{{HERO}}', age: 6 } }, provider);
  assert.ok(calls.length <= 5, `${calls.length} calls`);
  assert.ok(r.metadata.qualityWarnings?.length, 'remaining issues reported, not hidden');
});

const arbitrary: Array<[number, string]> = [[5, 'fire truck'], [8, 'my dog Max and a submarine'], [7, 'a refrigerator that sings opera'], [9, 'I become invisible every Wednesday']];
await test('Arbitrary inputs all take the same V2 path; request reaches PLAN verbatim; no prepared story is returned', async () => {
  const fixtureTitles = new Set(FIXTURES.map((f) => f.title));
  for (const [age, text] of arbitrary) {
    const body = Array.from({ length: 8 }, (_, i) => `Paragraph ${i + 1} is about ${text}, and {{HERO}} wonders what ${text} will do next.`).join('\n\n');
    const { provider, calls } = mockProvider([body]);
    const req = toEngineRequest({ ...george, childAge: age, interestsText: text });
    const r = await runStoryEngine({ ...req, child: { firstName: '{{HERO}}', age } }, provider);
    assert.equal(JSON.parse(calls[0].user).request.childsRequest, text);
    assert.deepEqual(calls.map((c) => c.stage).slice(0, 2), ['plan', 'writer']);
    assert.ok(!fixtureTitles.has(r.story.title));
    assert.equal(r.metadata.engine, 'v2-remote');
  }
});

await test('Benchmark examples still meet the local quality bar (they are tests, not the product)', () => {
  for (const f of FIXTURES) {
    const c = localCritique({ title: f.title, text: f.text.split('{{HERO}}').join(f.defaultHero) }, { req: { language: f.language, request: f.interpretation.explicitRequest, child: { age: f.age } }, interpretation: f.interpretation });
    assert.equal(c.status, 'pass', `${f.id}: ${c.issues.join('; ')}`);
  }
});

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}\n`);
