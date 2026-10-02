import type { CreatureId, GeneratedStory, LanguageCode, SettingId, StoryRequest } from '../../types/story';
import { familyForTheme } from '../../config/catalog';
import { ageBand, estimateDurationSeconds } from '../../config/ageProfiles';
import { normalize } from '../../utils/text';
import { hashString } from '../../utils/id';
import type { ArcId, DemoMood, LangPack } from './packs/types';
import { de } from './packs/de';
import { en } from './packs/en';
import { fr } from './packs/fr';

/**
 * DEMO story engine – runs fully on the device, no network, no costs.
 *
 * Layer 1 (imagination): interests → world (setting + companion creature),
 *                        mood → opening and ending, age → length and depth.
 * Layer 2 (guidance):     optional theme → a narrative arc that carries the
 *                        theme through metaphor and modelling (never a lesson).
 *
 * A real provider replaces this through services/storyService.ts.
 */
const PACKS: Partial<Record<LanguageCode, LangPack>> = { de, en, fr };

const KEYWORDS = {
  space: ['space', 'weltall', 'weltraum', 'rakete', 'raumschiff', 'planet', 'stern', 'astronaut', 'espace', 'fusee', 'vaisseau', 'etoile', 'cosmos', 'rocket', 'spaceship', 'star', 'galax', 'mond', 'moon', 'lune', 'ufo'],
  ocean: ['ocean', 'meer', 'sea', 'fish', 'fisch', 'wal', 'whale', 'mer', 'poisson', 'baleine', 'unterwasser', 'tauch', 'plage', 'strand', 'beach', 'pirat', 'boot', 'boat', 'bateau', 'schiff', 'hai', 'shark', 'requin', 'delfin', 'dolphin', 'dauphin', 'koralle', 'coral', 'corail'],
  dino: ['dino', 'saurier', 'rex', 'dinosaure', 'urzeit', 'prehist'],
  dragon: ['drache', 'dragon', 'zauber', 'magie', 'magic', 'fee', 'fairy', 'einhorn', 'unicorn', 'licorne', 'ritter', 'knight', 'chevalier', 'prinzess', 'princess'],
};

/** Counts keywords that start one of the words in the text (so "mer" ≠ "Zimmer"). */
function matches(haystack: string, words: string[]) {
  const tokens = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  return words.reduce((n, w) => n + (tokens.some((t) => t.startsWith(w)) ? 1 : 0), 0);
}

export function pickWorld(req: Pick<StoryRequest, 'interests' | 'interestsText'>): { setting: SettingId; creature: CreatureId } {
  const text = normalize([...req.interests, req.interestsText ?? ''].join(' '));
  const ids = new Set(req.interests);
  const spaceScore = matches(text, KEYWORDS.space) + (ids.has('space') ? 2 : 0) + (ids.has('vehicles') || ids.has('science') ? 1 : 0);
  const oceanScore = matches(text, KEYWORDS.ocean) + (ids.has('ocean') ? 2 : 0);
  const setting: SettingId = spaceScore === 0 && oceanScore === 0 ? 'forest' : spaceScore >= oceanScore ? 'space' : 'ocean';

  const dinoScore = matches(text, KEYWORDS.dino) + (ids.has('dinosaurs') ? 2 : 0);
  const dragonScore = matches(text, KEYWORDS.dragon) + (ids.has('dragons') ? 2 : 0) + (ids.has('magic') ? 1 : 0);
  const creature: CreatureId = dinoScore > 0 && dinoScore >= dragonScore ? 'dino' : dragonScore > 0 ? 'dragon' : 'otter';
  return { setting, creature };
}

const CUSTOM_HINTS: Array<[ArcId, string[]]> = [
  ['contact', ['kinder', 'freund', 'sprech', 'reden', 'kontakt', 'schuchtern', 'children', 'friend', 'talk', 'shy', 'approach', 'enfant', 'ami', 'parler', 'timide', 'gefuhl', 'feeling', 'emotion', 'wut', 'angry', 'colere', 'traurig', 'sad', 'triste']],
  ['courage', ['angst', 'mut', 'neu', 'schule', 'kita', 'umzug', 'afraid', 'scared', 'brave', 'new', 'school', 'move', 'peur', 'courage', 'nouveau', 'ecole', 'creche', 'demenag']],
  ['mistakes', ['fehler', 'verlier', 'perfekt', 'mistake', 'losing', 'perfect', 'erreur', 'perdre', 'parfait']],
  ['together', ['teilen', 'warten', 'geduld', 'abwechs', 'helfen', 'zuhoren', 'share', 'wait', 'patien', 'turn', 'help', 'listen', 'partager', 'attendre', 'tour', 'aider', 'ecouter']],
];

export function pickArc(req: Pick<StoryRequest, 'guidanceTheme' | 'customGuidance'>): ArcId {
  if (req.guidanceTheme === 'custom' && req.customGuidance) {
    const text = normalize(req.customGuidance);
    let best: ArcId = 'contact';
    let bestScore = 0;
    for (const [arc, words] of CUSTOM_HINTS) {
      const score = matches(text, words);
      if (score > bestScore) { best = arc; bestScore = score; }
    }
    return best;
  }
  return familyForTheme(req.guidanceTheme) ?? 'quest';
}

const MOOD_POOL: DemoMood[] = ['adventure', 'funny', 'calm', 'magical', 'discovery', 'bedtime'];

export function resolveMood(mood: StoryRequest['storyMood'], seed: number): DemoMood {
  return mood === 'surprise' ? MOOD_POOL[seed % MOOD_POOL.length] : mood;
}

function fill(template: string, vars: Record<string, string>): string {
  // two passes so placeholders inside inserted phrases are resolved too
  let out = template;
  for (let i = 0; i < 2; i++) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return out.replace(/\s{2,}/g, ' ').trim();
}

export function generateDemoStory(req: StoryRequest, seed = hashString(JSON.stringify(req) + Date.now())): GeneratedStory {
  const pack = PACKS[req.language] ?? PACKS.en!;
  const language: LanguageCode = PACKS[req.language] ? req.language : 'en';
  const band = ageBand(req.childAge);
  const { setting, creature } = pickWorld(req);
  const arcId = pickArc(req);
  const mood = resolveMood(req.storyMood, seed);

  const name = req.childName?.trim();
  const hero = name || pack.heroFallback;
  const s = pack.settings[setting];
  const c = pack.creatures[creature];
  const arc = pack.arcs[arcId];

  const interestWords = [
    ...req.interestLabels.map((l) => (pack.lowercaseInterests ? l.toLowerCase() : l)),
    ...(req.interestsText ?? '').split(/[,;\n]| und | and | et /).map((x) => x.trim().replace(/[.…]+$/, '')).filter(Boolean),
  ];
  const uniqueInterests = Array.from(new Map(interestWords.map((w) => [normalize(w), w])).values()).slice(0, 4);

  const vars: Record<string, string> = {
    hero,
    ...pack.heroVars(hero),
    cname: c.name,
    sound: c.sound,
    creatureIndef: c.indef,
    ...pack.creatureVars(c.name),
    othersNom: s.othersNom,
    OthersNom: s.OthersNom,
    othersDat: s.othersDat,
    othersDesc: s.othersDesc,
    activity: s.activity,
    gift: s.gift,
    place: s.place,
    hiding: s.hiding,
    interests: pack.listJoin(uniqueInterests),
  };
  vars.interestsLine = band.id !== 'little' && uniqueInterests.length ? fill(pack.interestsLine, vars) + ' ' : '';

  const paragraphs = [
    `${pack.moods[mood].opening} ${s.portal}`,
    s.arrival,
    pack.discovery,
    ...arc.paragraphs,
    ...(band.id === 'older' || req.childAge >= 8 ? [arc.older] : []),
    arc.farewell,
    `${s.ret} ${pack.moods[mood].ending}`,
  ].map((p) => fill(p, vars));

  const story = paragraphs.join('\n\n');
  const title = pack.title(name || undefined, c.name, s.title);

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    summary: pack.summary(s.summary, c.summary, arc.tagline),
    story,
    paragraphs,
    coverPrompt: buildDemoCoverPrompt(setting, creature, mood),
    estimatedDuration: estimateDurationSeconds(story, req.childAge),
    age: req.childAge,
    language,
    scene: { setting, creature, mood, seed },
  };
}

const SETTING_PROMPTS: Record<SettingId, string> = {
  space: 'a space station shaped like a glowing dandelion floating above a blue planet, tiny luminous houses on its threads',
  ocean: 'an underwater coral city with seashell houses and friendly jellyfish lanterns, soft light rays from above',
  forest: 'an enchanted forest tree village with rope bridges and softly glowing mushrooms at dusk',
};
const CREATURE_PROMPTS: Record<CreatureId, string> = {
  dino: 'a tiny friendly green baby dinosaur with round eyes',
  dragon: 'a small cat-sized dragon with crumpled tissue-paper wings',
  otter: 'a small otter pup with shiny fur and curious whiskers',
};

export function buildDemoCoverPrompt(setting: SettingId, creature: CreatureId, mood: DemoMood): string {
  return `${SETTING_PROMPTS[setting]}; ${CREATURE_PROMPTS[creature]}; a small floating warm light companion; ${mood} atmosphere`;
}
