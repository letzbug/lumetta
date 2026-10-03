// ─────────────────────────────────────────────────────────────
// Core domain types. Shared by UI, services and storage.
// ─────────────────────────────────────────────────────────────

/** All languages known to the system. `lb` is prepared but not yet enabled. */
export type LanguageCode = 'de' | 'fr' | 'en' | 'lb';

export type Gender = 'girl' | 'boy' | 'neutral';

export type StoryMood =
  | 'adventure'
  | 'funny'
  | 'calm'
  | 'magical'
  | 'discovery'
  | 'bedtime'
  | 'surprise';

export type InterestId =
  | 'dinosaurs'
  | 'space'
  | 'animals'
  | 'magic'
  | 'ocean'
  | 'adventure'
  | 'nature'
  | 'science'
  | 'music'
  | 'dragons'
  | 'friendship'
  | 'vehicles';

export type GuidanceThemeId =
  | 'confidence'
  | 'makingFriends'
  | 'talkingToOthers'
  | 'tryingNew'
  | 'handlingMistakes'
  | 'beingPatient'
  | 'understandingEmotions'
  | 'askingForHelp'
  | 'workingTogether'
  | 'feelingDifferent'
  | 'newEnvironments'
  | 'school'
  | 'listening'
  | 'takingTurns'
  | 'custom';

export type VoiceId = 'warm-female' | 'warm-male' | 'neutral';

/** What the parent describes. Never contains surname, birth date, school, address or photos. */
export interface StoryRequest {
  childAge: number;
  childName?: string;
  gender?: Gender;
  language: LanguageCode;
  interests: InterestId[];
  /** Localised labels for the selected interests (used by the story text). */
  interestLabels: string[];
  interestsText?: string;
  storyMood: StoryMood;
  guidanceTheme?: GuidanceThemeId;
  customGuidance?: string;
  voiceId: VoiceId;
}

/** Structured output of the story engine (demo or remote). */
export interface GeneratedStory {
  title: string;
  summary: string;
  story: string;
  paragraphs: string[];
  coverPrompt: string;
  estimatedDuration: number; // seconds
  age: number;
  language: LanguageCode;
  /** Visual hints used by the illustrated demo cover. */
  scene?: CoverScene;
}

export type SettingId = 'space' | 'ocean' | 'forest';
export type CreatureId = 'dino' | 'dragon' | 'otter';

/** Dedicated cover compositions for Story Engine V2 demo stories. */
export type CoverSubject = 'digger' | 'park' | 'cat' | 'crocodile' | 'abstract';

export interface CoverScene {
  setting: SettingId;
  creature: CreatureId;
  mood: Exclude<StoryMood, 'surprise'>;
  seed: number;
  /** when set, the illustrated cover paints this subject instead of setting + creature */
  subject?: CoverSubject;
}

export interface CoverImage {
  kind: 'illustration' | 'image';
  /** data: URL (SVG for the illustrated demo, PNG/JPEG for remote images). */
  src: string;
  /** Dominant colours, used for the player atmosphere. */
  palette: { deep: string; mid: string; glow: string };
}

/** A story as kept in the library. */
export interface Story extends GeneratedStory {
  /** Stable unique id – also what a future physical object will reference. */
  id: string;
  schemaVersion: 1;
  createdAt: string;
  childName?: string;
  mood: Exclude<StoryMood, 'surprise'>;
  interests: InterestId[];
  guidanceTheme?: GuidanceThemeId;
  /** We only keep THAT custom guidance was used – never the parent's text. */
  usedCustomGuidance: boolean;
  cover: CoverImage;
  voiceId: VoiceId;
  favorite: boolean;
  saved: boolean;
  source: 'demo' | 'remote';
  /**
   * Future physical-object support (NFC / RFID / QR / Bluetooth).
   * A figure or card will carry this id and launch the story via
   * the deep link  #/story/<id>  (see services/triggerService.ts).
   */
  externalTriggerId: string | null;
  /** Story Engine V2 metadata – optional so stories saved by V1 still load. */
  engine?: {
    version: 2;
    /** 'v2-demo-fixture' | 'v2-demo-template' only appear in stories saved before the correction */
    kind: 'v2-remote' | 'v2-demo-example' | 'v2-demo-fixture' | 'v2-demo-template';
    storyForm: string;
    fingerprint?: import('../services/storyEngine/schemas').StoryFingerprint;
    scenes?: import('../services/storyEngine/schemas').SceneSketch[];
  };
}

export type GenerationStage = 'finding' | 'characters' | 'magic' | 'ready';
