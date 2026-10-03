import type { LlmProvider } from './provider';
import { requestBlock, targetWords } from './prompts';
import { GUIDANCE } from '../../config/catalog';
import { detectCliches } from './cliches';
import { validateCritique, type Critique, type EngineRequest, type Interpretation, type ProblemLayer, type WrittenStory } from './schemas';

const ORDER: ProblemLayer[] = ['concept', 'architect', 'character', 'guidance', 'writer'];
export const earliest = (a: ProblemLayer | null, b: ProblemLayer | null): ProblemLayer | null => {
  if (!a) return b;
  if (!b) return a;
  return ORDER.indexOf(a) <= ORDER.indexOf(b) ? a : b;
};

const STOP = /^(und|oder|der|die|das|ein|eine|mit|the|and|with|les|des|une|avec|dans|mein|meine|my|mon|ma|ich|i|je|im|in)$/i;

/** Rough SWAP TEST: are the request's core elements actually present in the story? */
export function personalizationCoverage(text: string, elements: string[]): number {
  if (!elements.length) return 1;
  const lower = text.toLowerCase();
  const hit = elements.filter((el) => {
    const words = el.toLowerCase().split(/[^a-zà-ÿäöüß0-9]+/).filter((w) => w.length > 3 && !STOP.test(w));
    if (!words.length) return true;
    return words.some((w) => lower.includes(w.slice(0, Math.max(4, Math.ceil(w.length * 0.7)))));
  });
  return hit.length / elements.length;
}

/**
 * Deterministic checks that run in every mode (also demo):
 * forbidden phrasing, clichés used as defaults, length, sound-effect spam,
 * name handling and a rough swap test.
 */
export function localCritique(
  story: Pick<WrittenStory, 'text' | 'title'>,
  ctx: { req: EngineRequest; interpretation?: Interpretation; heroToken?: string },
): Critique {
  const issues: string[] = [];
  const instructions: string[] = [];
  let layer: ProblemLayer | null = null;
  const flag = (l: ProblemLayer, issue: string, instruction: string) => {
    issues.push(issue);
    instructions.push(instruction);
    layer = earliest(layer, l);
  };
  const text = story.text;
  const lower = text.toLowerCase();

  for (const phrase of GUIDANCE.forbiddenPhrasing[ctx.req.language] ?? GUIDANCE.forbiddenPhrasing.en ?? [])
    if (lower.includes(phrase.toLowerCase())) flag(ctx.req.guidance?.length ? 'guidance' : 'writer', `forbidden phrasing "${phrase}"`, `Remove "${phrase}" – show, never lecture.`);

  for (const c of detectCliches(text, ctx.req.request)) flag(c.layer, `cliché: ${c.note}`, `Replace the default "${c.note}" with something that belongs to this specific idea.`);

  const words = text.split(/\s+/).filter(Boolean).length;
  const [min, max] = targetWords(ctx.req.child?.age ?? 6, ctx.req.desiredDurationMinutes);
  if (words < min * 0.7) flag('writer', `too short (${words} words)`, `Develop scenes and dialogue to about ${min}–${max} words.`);
  if (words > max * 1.4) flag('writer', `too long (${words} words)`, `Tighten to about ${min}–${max} words.`);

  const shouts = (text.match(/\b[A-ZÄÖÜ]{3,}[!.…]?(?=\s|$)/g) ?? []).filter((w) => !/^(OK|DJ|TV|UFO|NASA)$/.test(w)).length;
  if (shouts > 6) flag('writer', `sound-effect overuse (${shouts})`, 'Keep at most two or three sound effects where they really help.');

  if (ctx.heroToken && ctx.req.child?.firstName && !text.includes(ctx.heroToken))
    flag('writer', 'protagonist token missing', `Use ${ctx.heroToken} for the child protagonist.`);

  if (ctx.interpretation) {
    const coverage = personalizationCoverage(text, [...ctx.interpretation.nonNegotiables, ...ctx.interpretation.coreElements].slice(0, 8));
    if (coverage < 0.5)
      flag('concept', `swap test failed: only ${Math.round(coverage * 100)}% of the requested elements shape the story`, 'Rebuild the story so the child\'s actual request drives world, events and characters.');
  }

  return { status: issues.length ? 'rewrite' : 'pass', problemLayer: layer, issues, rewriteInstructions: instructions };
}

/** The model critic (remote mode) – asks the 15 questions of the spec. */
export function modelCritique(req: EngineRequest, interpretation: Interpretation, story: WrittenStory, provider: LlmProvider): Promise<Critique> {
  const user = JSON.stringify(
    {
      request: JSON.parse(requestBlock(req)),
      nonNegotiables: interpretation.nonNegotiables,
      specialRules: interpretation.specialRules,
      guidanceRequested: req.guidance?.length || req.customGuidance ? true : false,
      story: { title: story.title, text: story.text },
    },
    null,
    2,
  );
  return provider.generateStructured('critic', user, validateCritique);
}

export function mergeCritiques(a: Critique, b: Critique): Critique {
  const rewrite = a.status === 'rewrite' || b.status === 'rewrite';
  return {
    status: rewrite ? 'rewrite' : 'pass',
    problemLayer: rewrite ? earliest(a.status === 'rewrite' ? a.problemLayer : null, b.status === 'rewrite' ? b.problemLayer : null) ?? 'writer' : null,
    issues: [...a.issues, ...b.issues],
    rewriteInstructions: [...a.rewriteInstructions, ...b.rewriteInstructions],
  };
}
