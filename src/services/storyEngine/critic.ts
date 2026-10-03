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

/** Sentences that merely inject an interest into an unrelated story (the V1 failure). */
export const INTEREST_INJECTION: RegExp[] = [
  /thought about (all )?the things/i,
  /things that make (a|the|your) heart beat faster/i,
  /it felt as if this journey were heading/i,
  /dachte an (all )?die dinge/i,
  /das herz schneller schlagen lassen/i,
  /als würde diese reise genau dorthin führen/i,
  /pensa à tout ce qui fait battre/i,
  /comme si ce voyage menait tout droit/i,
];

/** Names and places of the retired V1 template engine – must never appear in V2 output. */
export const LEGACY_TEMPLATE_MARKERS = /mosslight|mooslicht|mousselune|pusteblume|dandelion station|pearlshine|perlmutt|cité de nacre|station pissenlit|moon-hoppers|mondhüpfer|sauteurs de lune/i;

const STOP = new Set(['und', 'oder', 'der', 'die', 'das', 'ein', 'eine', 'einen', 'mit', 'the', 'and', 'with', 'les', 'des', 'une', 'avec', 'dans', 'mein', 'meine', 'my', 'mon', 'ma', 'ich', 'im', 'in', 'a', 'an', 'of', 'de', 'la', 'le', 'un', 'to', 'is', 'that', 'who', 'can', 'kann', 'nur', 'only', 'every', 'jeden', 'zum', 'zur', 'and', 'et', 'ou', 'qui', 'que']);

const words = (phrase: string) =>
  phrase.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 && !STOP.has(w));

/** Elements of the request in the child's own words ("red car", "fire truck + Max"). */
export function requestElements(request: string): string[] {
  return request
    .split(/\s*(?:\+|,|;|\n|\band\b|\bund\b|\bet\b)\s*/i)
    .map((s) => s.trim())
    .filter((s) => words(s).length > 0)
    .slice(0, 6);
}

function wordRegex(w: string) {
  const stem = w.length <= 4 ? w : w.slice(0, Math.max(4, Math.ceil(w.length * 0.7)));
  return new RegExp(`(^|[^\\p{L}])${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'iu');
}

/** Does a paragraph contain ALL significant words of an element? */
const containsElement = (paragraph: string, element: string) => words(element).every((w) => wordRegex(w).test(paragraph));

export interface CoverageReport {
  element: string;
  paragraphs: number;
  firstAt: number; // 0..1 position of first appearance, 1 = never
}

/** SWAP TEST heuristic: the subject must recur across the story and appear early. */
export function personalizationReport(text: string, elements: string[]): CoverageReport[] {
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim());
  return elements.map((element) => {
    const hits = paras.map((p) => containsElement(p, element));
    const first = hits.indexOf(true);
    return { element, paragraphs: hits.filter(Boolean).length, firstAt: first === -1 ? 1 : first / Math.max(1, paras.length) };
  });
}

export function personalizationCoverage(text: string, elements: string[]): number {
  if (!elements.length) return 1;
  return personalizationReport(text, elements).filter((r) => r.paragraphs > 0).length / elements.length;
}

/**
 * Deterministic checks – run in every mode, cost nothing:
 * legacy template reuse, interest injection, swap test, forbidden phrasing,
 * clichés used as defaults, length, sound-effect spam, name handling.
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

  if (!story.title?.trim()) flag('writer', 'missing title', 'Give the story a title that belongs to it.');
  if (LEGACY_TEMPLATE_MARKERS.test(text) || LEGACY_TEMPLATE_MARKERS.test(story.title))
    flag('concept', 'retired V1 template content detected', 'Invent the story from the request – no stock worlds.');
  if (INTEREST_INJECTION.some((re) => re.test(text)))
    flag('concept', 'interest merely injected as a sentence', 'Make the requested subject drive premise and events instead of mentioning it.');

  for (const phrase of GUIDANCE.forbiddenPhrasing[ctx.req.language] ?? GUIDANCE.forbiddenPhrasing.en ?? [])
    if (lower.includes(phrase.toLowerCase())) flag(ctx.req.guidance?.length ? 'guidance' : 'writer', `forbidden phrasing "${phrase}"`, `Remove "${phrase}" – show, never lecture.`);

  for (const c of detectCliches(text, ctx.req.request)) flag(c.layer, `cliché: ${c.note}`, `Replace the default "${c.note}" with something that belongs to this specific idea.`);

  const count = text.split(/\s+/).filter(Boolean).length;
  const [min, max] = targetWords(ctx.req.child?.age ?? 6, ctx.req.desiredDurationMinutes);
  if (count < min * 0.7) flag('writer', `too short (${count} words)`, `Develop scenes and dialogue to about ${min}–${max} words.`);
  if (count > max * 1.4) flag('writer', `too long (${count} words)`, `Tighten to about ${min}–${max} words.`);

  const shouts = (text.match(/\b[A-ZÄÖÜ]{3,}[!.…]?(?=\s|$)/g) ?? []).filter((w) => !/^(OK|DJ|TV|UFO|NASA)$/.test(w)).length;
  if (shouts > 6) flag('writer', `sound-effect overuse (${shouts})`, 'Keep at most two or three sound effects where they really help.');

  const name = ctx.req.child?.firstName;
  if (ctx.heroToken && name && !text.includes(ctx.heroToken)) flag('writer', 'protagonist token missing', `Use ${ctx.heroToken} for the child protagonist.`);
  if (name && name !== ctx.heroToken) {
    const wrongCase = new RegExp(`(^|[^\\p{L}])(${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![\\p{L}])`, 'giu');
    if ([...text.matchAll(wrongCase)].some((m) => m[2] !== name)) flag('writer', `name not capitalised as "${name}"`, `Write the name exactly as "${name}".`);
  }

  // SWAP TEST: requested elements must recur and appear early, not once in passing
  const elements = ctx.interpretation?.nonNegotiables.length
    ? ctx.interpretation.nonNegotiables
    : requestElements(ctx.req.request);
  const report = personalizationReport(text, elements.slice(0, 5));
  const weak = report.filter((r) => r.paragraphs < 2 || r.firstAt > 0.35);
  if (report.length && weak.length > report.length / 2)
    flag(
      'concept',
      `swap test failed: ${weak.map((r) => `"${r.element}" in ${r.paragraphs} paragraph(s)`).join(', ')}`,
      'Rebuild the story so the child\'s actual request drives premise, events and characters from the opening on.',
    );

  return { status: issues.length ? 'rewrite' : 'pass', problemLayer: layer, issues, rewriteInstructions: instructions };
}

/** Model critic (granular mode). In efficient mode the critic runs inside the REVIEW call. */
export function modelCritique(req: EngineRequest, interpretation: Interpretation, story: WrittenStory, provider: LlmProvider): Promise<Critique> {
  const user = JSON.stringify(
    {
      request: JSON.parse(requestBlock(req)),
      nonNegotiables: interpretation.nonNegotiables,
      specialRules: interpretation.specialRules,
      guidanceRequested: Boolean(req.guidance?.length || req.customGuidance),
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
