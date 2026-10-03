import type { LlmProvider } from './provider';
import { requestBlock } from './prompts';
import { validateImagination, type Candidate, type EngineRequest, type ImaginationResult, type Interpretation } from './schemas';

const STOP = new Set(['the', 'and', 'with', 'that', 'this', 'from', 'into', 'their', 'they', 'when', 'who', 'what', 'about', 'there', 'where', 'which', 'child', 'story', 'their', 'a', 'an', 'of', 'to', 'in', 'is']);
const tokens = (t: string) => new Set(t.toLowerCase().split(/[^a-zà-ÿ0-9]+/).filter((w) => w.length > 3 && !STOP.has(w)));

/** Rough similarity of two candidates' premise + mechanism (Jaccard). */
export function similarity(a: Candidate, b: Candidate): number {
  const A = tokens(`${a.premise} ${a.centralDevice}`);
  const B = tokens(`${b.premise} ${b.centralDevice}`);
  const inter = [...A].filter((w) => B.has(w)).length;
  return inter / Math.max(1, A.size + B.size - inter);
}

export function tooSimilarPairs(candidates: Candidate[], threshold = 0.45): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < candidates.length; i++)
    for (let j = i + 1; j < candidates.length; j++)
      if (similarity(candidates[i], candidates[j]) > threshold) pairs.push([candidates[i].id, candidates[j].id]);
  return pairs;
}

/** Stage 2 – several fundamentally different stories, with a diversity check. */
export async function imagine(
  req: EngineRequest,
  interpretation: Interpretation,
  provider: LlmProvider,
  opts: { count?: number; avoid?: string[] } = {},
): Promise<ImaginationResult> {
  const count = opts.count ?? 4;
  const base = {
    request: JSON.parse(requestBlock(req)),
    interpretation,
    numberOfCandidates: count,
    recentFingerprints: req.recentFingerprints?.slice(0, 6) ?? [],
    avoidTheseRejectedPremises: opts.avoid?.length ? opts.avoid : undefined,
  };
  let result = await provider.generateStructured('imagination', JSON.stringify(base, null, 2), validateImagination);

  const similar = tooSimilarPairs(result.candidates);
  if (!result.diversityCheck.genuinelyDifferent || similar.length) {
    const retry = {
      ...base,
      diversityFeedback: `These candidates are the same story in different costumes: ${similar.map((p) => p.join(' ≈ ')).join(', ') || result.diversityCheck.note}. Replace them with genuinely different situations, mechanisms, tones and scales.`,
      previousCandidates: result.candidates.map((c) => ({ id: c.id, premise: c.premise, centralDevice: c.centralDevice })),
    };
    result = await provider.generateStructured('imagination', JSON.stringify(retry, null, 2), validateImagination);
  }
  return result;
}
