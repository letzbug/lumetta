// ─────────────────────────────────────────────────────────────
// Story Engine V2 – data contracts for every pipeline stage.
// Model output is NEVER trusted blindly: each stage result goes
// through a validator that coerces, fills safe defaults and
// throws SchemaError when something essential is missing.
// ─────────────────────────────────────────────────────────────
import type { LanguageCode } from '../../types/story';

export type Scale = 'intimate' | 'small' | 'medium' | 'expansive';
export type ProblemLayer = 'writer' | 'character' | 'guidance' | 'architect' | 'concept';

export interface StoryFingerprint {
  genre: string;
  scale: Scale;
  settingType: string;
  centralDevice: string;
  characterTypes: string[];
  structureType: string;
  endingStyle: string;
  majorMotifs: string[];
}

export interface EngineRequest {
  child?: { firstName?: string; age: number; gender?: string };
  language: LanguageCode;
  /** what the child/parent asked for, in their own words (chips + free text) */
  request: string;
  interests?: string[];
  mood?: string;
  guidance?: string[];
  /** parent's own description – used once, never stored */
  customGuidance?: string;
  desiredDurationMinutes?: number;
  recentFingerprints?: StoryFingerprint[];
}

export interface Interpretation {
  explicitRequest: string;
  coreElements: string[];
  requestedCharacters: string[];
  requestedSetting: string | null;
  requestedEvents: string[];
  nonNegotiables: string[];
  creativeFreedom: string[];
  specialRules: string[];
  mostInterestingPotential: string;
  naturalScale: Scale;
  possibleStoryEnergy: string[];
  constraints: string[];
}

export interface Candidate {
  id: string;
  premise: string;
  whyInteresting: string;
  storyEnergy: string[];
  scale: Scale;
  centralDevice: string;
  characterPotential: string;
  distinctiveElement: string;
  possibleWeakness: string;
}

export interface ImaginationResult {
  candidates: Candidate[];
  diversityCheck: { genuinelyDifferent: boolean; note: string };
}

export interface Selection {
  candidateId: string;
  reasoning: string;
}

export interface Architecture {
  corePremise: string;
  whyWorthHearing: string;
  storyForm: string;
  protagonist: { identity: string; immediateWant: string; agency: string };
  setting: string;
  storySpecificDetails: string[];
  curiosityMechanism: string;
  development: string;
  possibleSurprises: string[];
  importantChoices: string[];
  endingDirection: string;
  thingsToAvoid: string[];
}

export interface CharacterSheet {
  name: string;
  role: string;
  personality: string;
  wants: string;
  dislikes: string;
  oddHabit: string;
  speechStyle: string;
  unexpectedTrait: string;
  relationshipToProtagonist: string;
}

export interface GuidancePlan {
  included: boolean;
  theme?: string;
  opportunity?: string;
  integrationNotes?: string;
  reducedReason?: string;
}

/** Prepared for the future "living picture book" – not rendered yet. */
export interface SceneSketch {
  title: string;
  fromParagraph: number;
  toParagraph: number;
  visual: string;
}

export interface WrittenStory {
  title: string;
  text: string;
  /** Same story prepared for expressive TTS. May add delivery cues but must not change the spoken wording. */
  voiceScript?: string;
  summary: string;
  coverScene: string;
  scenes?: SceneSketch[];
}

export interface Critique {
  status: 'pass' | 'rewrite';
  problemLayer: ProblemLayer | null;
  issues: string[];
  rewriteInstructions: string[];
}

export interface EngineResult {
  story: {
    id: string;
    title: string;
    language: LanguageCode;
    age: number;
    text: string;
    voiceScript?: string;
    estimatedDurationSeconds: number;
  };
  metadata: {
    storyForm: string;
    mood: string[];
    summary: string;
    coverPrompt: string;
    fingerprint: StoryFingerprint;
    scenes?: SceneSketch[];
    engine: 'v2-remote' | 'v2-demo-example';
    /** remaining critic issues if the rewrite budget was exhausted (development info) */
    qualityWarnings?: string[];
  };
  /** development only – never shown in the child-facing UI */
  debug?: {
    interpretation?: Interpretation;
    candidates?: Candidate[];
    selection?: Selection;
    architecture?: Architecture;
    characters?: CharacterSheet[];
    guidance?: GuidancePlan;
    critiques: Critique[];
    revisions: number;
  };
}

// ── validation helpers ──────────────────────────────────────
export class SchemaError extends Error {
  constructor(public stage: string, message: string) {
    super(`[${stage}] ${message}`);
    this.name = 'SchemaError';
  }
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : fallback);
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : typeof v === 'string' && v ? [v] : []);
const SCALES: Scale[] = ['intimate', 'small', 'medium', 'expansive'];
const scale = (v: unknown, fallback: Scale = 'small'): Scale => (SCALES.includes(v as Scale) ? (v as Scale) : fallback);

function need(stage: string, value: string, field: string) {
  if (!value) throw new SchemaError(stage, `missing ${field}`);
  return value;
}

export function validateInterpretation(raw: unknown): Interpretation {
  if (!isObj(raw)) throw new SchemaError('interpreter', 'not an object');
  return {
    explicitRequest: str(raw.explicitRequest),
    coreElements: strArr(raw.coreElements),
    requestedCharacters: strArr(raw.requestedCharacters),
    requestedSetting: str(raw.requestedSetting) || null,
    requestedEvents: strArr(raw.requestedEvents),
    nonNegotiables: strArr(raw.nonNegotiables),
    creativeFreedom: strArr(raw.creativeFreedom),
    specialRules: strArr(raw.specialRules),
    mostInterestingPotential: need('interpreter', str(raw.mostInterestingPotential), 'mostInterestingPotential'),
    naturalScale: scale(raw.naturalScale),
    possibleStoryEnergy: strArr(raw.possibleStoryEnergy),
    constraints: strArr(raw.constraints),
  };
}

export function validateCandidate(raw: unknown, index: number): Candidate {
  if (!isObj(raw)) throw new SchemaError('imagination', `candidate ${index} not an object`);
  return {
    id: str(raw.id) || `c${index + 1}`,
    premise: need('imagination', str(raw.premise), `candidate ${index}.premise`),
    whyInteresting: str(raw.whyInteresting),
    storyEnergy: strArr(raw.storyEnergy),
    scale: scale(raw.scale),
    centralDevice: need('imagination', str(raw.centralDevice), `candidate ${index}.centralDevice`),
    characterPotential: str(raw.characterPotential),
    distinctiveElement: str(raw.distinctiveElement),
    possibleWeakness: str(raw.possibleWeakness),
  };
}

export function validateImagination(raw: unknown): ImaginationResult {
  if (!isObj(raw) || !Array.isArray(raw.candidates)) throw new SchemaError('imagination', 'missing candidates');
  const candidates = raw.candidates.map(validateCandidate);
  if (candidates.length < 2) throw new SchemaError('imagination', 'need at least two candidates');
  const ids = new Set<string>();
  candidates.forEach((c, i) => {
    if (ids.has(c.id)) c.id = `c${i + 1}`;
    ids.add(c.id);
  });
  const dc = isObj(raw.diversityCheck) ? raw.diversityCheck : {};
  return { candidates, diversityCheck: { genuinelyDifferent: dc.genuinelyDifferent !== false, note: str(dc.note) } };
}

export function validateSelection(raw: unknown, candidates: Candidate[]): Selection {
  if (!isObj(raw)) throw new SchemaError('selector', 'not an object');
  const id = str(raw.candidateId);
  const found = candidates.find((c) => c.id === id);
  return { candidateId: found ? found.id : candidates[0].id, reasoning: str(raw.reasoning) };
}

export function validateArchitecture(raw: unknown): Architecture {
  if (!isObj(raw)) throw new SchemaError('architect', 'not an object');
  const p = isObj(raw.protagonist) ? raw.protagonist : {};
  return {
    corePremise: need('architect', str(raw.corePremise), 'corePremise'),
    whyWorthHearing: str(raw.whyWorthHearing),
    storyForm: str(raw.storyForm, 'story') || 'story',
    protagonist: { identity: str(p.identity), immediateWant: str(p.immediateWant), agency: str(p.agency) },
    setting: str(raw.setting),
    storySpecificDetails: strArr(raw.storySpecificDetails),
    curiosityMechanism: str(raw.curiosityMechanism),
    development: str(raw.development),
    possibleSurprises: strArr(raw.possibleSurprises),
    importantChoices: strArr(raw.importantChoices),
    endingDirection: str(raw.endingDirection),
    thingsToAvoid: strArr(raw.thingsToAvoid),
  };
}

export function validateCharacters(raw: unknown): CharacterSheet[] {
  const list = isObj(raw) && Array.isArray(raw.characters) ? raw.characters : Array.isArray(raw) ? raw : null;
  if (!list) throw new SchemaError('characters', 'missing characters');
  return list.filter(isObj).map((c) => ({
    name: str(c.name) || 'unnamed',
    role: str(c.role),
    personality: str(c.personality),
    wants: str(c.wants),
    dislikes: str(c.dislikes),
    oddHabit: str(c.oddHabit),
    speechStyle: str(c.speechStyle),
    unexpectedTrait: str(c.unexpectedTrait),
    relationshipToProtagonist: str(c.relationshipToProtagonist),
  }));
}

export function validateGuidancePlan(raw: unknown): GuidancePlan {
  if (!isObj(raw)) throw new SchemaError('guidance', 'not an object');
  return {
    included: raw.included === true,
    theme: str(raw.theme) || undefined,
    opportunity: str(raw.opportunity) || undefined,
    integrationNotes: str(raw.integrationNotes) || undefined,
    reducedReason: str(raw.reducedReason) || undefined,
  };
}

export function validateWrittenStory(raw: unknown): WrittenStory {
  if (!isObj(raw)) throw new SchemaError('writer', 'not an object');
  const text = need('writer', str(raw.text), 'text').replace(/\r/g, '');
  if (text.split(/\s+/).length < 120) throw new SchemaError('writer', 'story too short');
  const scenes = Array.isArray(raw.scenes)
    ? raw.scenes.filter(isObj).map((s) => ({
        title: str(s.title),
        fromParagraph: Number(s.fromParagraph) || 0,
        toParagraph: Number(s.toParagraph) || 0,
        visual: str(s.visual),
      }))
    : undefined;
  return {
    title: need('writer', str(raw.title), 'title'),
    text,
    voiceScript: str(raw.voiceScript) || undefined,
    summary: str(raw.summary),
    coverScene: str(raw.coverScene),
    scenes,
  };
}

const LAYERS: ProblemLayer[] = ['writer', 'character', 'guidance', 'architect', 'concept'];
export function validateCritique(raw: unknown): Critique {
  if (!isObj(raw)) throw new SchemaError('critic', 'not an object');
  const status = raw.status === 'rewrite' ? 'rewrite' : 'pass';
  const layer = LAYERS.includes(raw.problemLayer as ProblemLayer) ? (raw.problemLayer as ProblemLayer) : null;
  return {
    status,
    problemLayer: status === 'rewrite' ? layer ?? 'writer' : null,
    issues: strArr(raw.issues),
    rewriteInstructions: strArr(raw.rewriteInstructions),
  };
}

export function validateFingerprint(raw: unknown): StoryFingerprint | null {
  if (!isObj(raw)) return null;
  return {
    genre: str(raw.genre, 'story'),
    scale: scale(raw.scale),
    settingType: str(raw.settingType),
    centralDevice: str(raw.centralDevice),
    characterTypes: strArr(raw.characterTypes).slice(0, 6),
    structureType: str(raw.structureType),
    endingStyle: str(raw.endingStyle),
    majorMotifs: strArr(raw.majorMotifs).slice(0, 8),
  };
}

// ── efficient mode: combined plan + review ──────────────────
export interface StoryPlan {
  interpretation: Interpretation;
  candidates: Candidate[];
  diversityCheck: { genuinelyDifferent: boolean; note: string };
  selection: Selection;
  architecture: Architecture;
  characters: CharacterSheet[];
  guidance: GuidancePlan;
}

export function validatePlan(raw: unknown): StoryPlan {
  if (!isObj(raw)) throw new SchemaError('plan', 'not an object');
  const imagination = validateImagination({ candidates: raw.candidates, diversityCheck: raw.diversityCheck });
  return {
    interpretation: validateInterpretation(raw.interpretation),
    candidates: imagination.candidates,
    diversityCheck: imagination.diversityCheck,
    selection: validateSelection(raw.selection ?? {}, imagination.candidates),
    architecture: validateArchitecture(raw.architecture),
    characters: raw.characters === undefined ? [] : validateCharacters({ characters: raw.characters }),
    guidance: isObj(raw.guidance) ? validateGuidancePlan(raw.guidance) : { included: false },
  };
}

export function validateReview(raw: unknown): { critique: Critique; fingerprint: StoryFingerprint | null } {
  if (!isObj(raw)) throw new SchemaError('review', 'not an object');
  return { critique: validateCritique(raw.critique ?? {}), fingerprint: validateFingerprint(raw.fingerprint) };
}
