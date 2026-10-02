import type { CreatureId, SettingId, StoryMood } from '../../../types/story';
import type { GuidanceFamily } from '../../../config/catalog';

/**
 * A language pack for the DEMO story engine.
 *
 * Texts use {placeholders}. Available everywhere:
 *   {hero} {heroPoss} {deHero}            – the child (or a neutral hero name)
 *   {cname} {cnamePoss} {deCname} {sound} – the companion creature
 *   {othersNom} {OthersNom} {othersDat} {othersDesc} {activity} {gift} {place}
 *   {interests}                           – what the child loves (interestsLine only)
 *
 * Grammar is handled by writing full phrases per setting instead of assembling
 * nouns, so German cases and French agreement stay correct.
 */
export type ArcId = GuidanceFamily | 'quest';
export type DemoMood = Exclude<StoryMood, 'surprise'>;

export interface SettingText {
  title: string;
  summary: string;
  place: string;
  portal: string;
  arrival: string;
  hiding: string;
  othersNom: string;
  OthersNom: string;
  othersDat: string;
  othersDesc: string;
  activity: string;
  gift: string;
  ret: string;
}

export interface CreatureText {
  name: string;
  sound: string;
  indef: string;
  summary: string;
}

export interface ArcText {
  paragraphs: string[];
  older: string;
  farewell: string;
  tagline: string;
}

export interface LangPack {
  heroFallback: string;
  heroVars: (hero: string) => Record<string, string>;
  creatureVars: (name: string) => Record<string, string>;
  listJoin: (items: string[]) => string;
  lowercaseInterests: boolean;
  moods: Record<DemoMood, { opening: string; ending: string }>;
  settings: Record<SettingId, SettingText>;
  creatures: Record<CreatureId, CreatureText>;
  discovery: string;
  interestsLine: string;
  arcs: Record<ArcId, ArcText>;
  title: (hero: string | undefined, cname: string, settingTitle: string) => string;
  summary: (settingSummary: string, creatureSummary: string, tagline: string) => string;
}
