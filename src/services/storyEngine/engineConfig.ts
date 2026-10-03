// ─────────────────────────────────────────────────────────────
// Story Engine V2 – central engine configuration.
//
// mode 'efficient' (default): the logical stages stay separate in code and
//   in the prompt, but compatible stages share one structured call:
//     1. PLAN    = Interpreter + Imagination + Selector + Architect + Characters + Guidance
//     2. WRITE   = Age/language-aware writer
//     3. REVIEW  = Critic + Fingerprint (one small call)
//   → typically 3 model calls per story, at most 5 with one rewrite.
//
// mode 'granular': one call per stage (≈ 9–14 calls). Useful for debugging
//   or for very small/cheap models that struggle with combined JSON.
// ─────────────────────────────────────────────────────────────
export type EngineMode = 'efficient' | 'granular';

export const ENGINE_CONFIG = {
  mode: 'efficient' as EngineMode,
  /** full rewrite cycles after the first draft – never unbounded */
  maxRewrites: 1,
  /** model-based critic (the deterministic local critic always runs, free) */
  modelCritic: true,
  candidates: 4,
} as const;
