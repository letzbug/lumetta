import { principles, ageProfiles } from './config.mjs';

const LANGUAGE_NAMES = { de: 'German', fr: 'French', en: 'English', lb: 'Luxembourgish (Lëtzebuergesch)' };
const MOODS = {
  adventure: 'an adventure with one brave moment',
  funny: 'funny, with giggles and silly surprises',
  calm: 'calm, slow and gentle',
  magical: 'magical, full of small wonders',
  discovery: 'curious discovery, with questions and new things',
  bedtime: 'a bedtime story that winds down softly into sleep',
  surprise: 'any kind of story that fits the interests best',
};

export function ageBand(age) {
  return ageProfiles.bands.find((b) => age >= b.minAge && age <= b.maxAge) ?? ageProfiles.bands[1];
}

/**
 * LAYER 1: imagination engine (interests, mood, age)
 * LAYER 2: optional story guidance (principles.json) – underneath, never on top.
 */
export function buildStoryPrompt(input) {
  const band = ageBand(input.childAge);
  const language = LANGUAGE_NAMES[input.language] ?? 'English';
  const theme = principles.themes.find((t) => t.id === input.guidanceTheme);
  const forbidden = principles.forbiddenPhrasing[input.language] ?? principles.forbiddenPhrasing.en;

  const system = [
    'You are a warm, gifted children’s author writing short, original picture-book stories to be read aloud.',
    `Write in ${language}. Natural, idiomatic, grammatically flawless, suitable for being read aloud.`,
    '',
    'AGE ADAPTATION',
    `Child age: ${input.childAge}. Band "${band.id}".`,
    `Sentence length: ${band.sentenceLength}. Vocabulary: ${band.vocabulary}.`,
    `Emotional complexity: ${band.emotionalComplexity}. Structure: ${band.structure}.`,
    `Length: ${band.wordsTarget[0]}–${band.wordsTarget[1]} words (about 3–4 minutes read aloud). Use 8–12 paragraphs separated by a blank line.`,
    '',
    'THE HERO',
    input.hasName
      ? `The main character is the child, always written exactly as the token ${input.heroToken} (never replace or translate the token). It will be swapped for the real first name on the device.`
      : 'The main character is a child with a short, gender-neutral invented first name.',
    input.gender === 'girl' ? 'The hero is a girl.' : input.gender === 'boy' ? 'The hero is a boy.' : 'Avoid gendered pronouns for the hero where natural; repeat the name instead.',
    '',
    'CORE PRINCIPLES (must all be respected)',
    ...principles.corePrinciples.map((p) => `- ${p}`),
    '',
    'NARRATIVE TECHNIQUES you may use for the optional guidance theme',
    ...principles.narrativeTechniques.map((p) => `- ${p}`),
    '',
    'NEVER',
    `- use phrases like: ${forbidden.map((f) => `"${f}"`).join(', ')}`,
    '- address the child as having a problem, diagnose, label or name a condition, or promise therapeutic effects',
    '- include frightening, violent, shaming, romantic or age-inappropriate content',
    '- include copyrighted or trademarked characters, real people, brands or places of worship',
    '- end with an explicit moral or lesson',
    '',
    'OUTPUT: only a JSON object, no markdown, with exactly these keys:',
    '{"title": string, "summary": string (one sentence for parents), "story": string (paragraphs separated by \\n\\n), "coverPrompt": string (English, one sentence describing the cover scene: setting, a companion creature and a small floating warm light; no text, no names, do not depict the hero\'s face), "language": string}',
  ].join('\n');

  const wishes = {
    interests: input.interests,
    inTheirOwnWords: input.interestsText || undefined,
    storyKind: MOODS[input.storyMood] ?? MOODS.surprise,
    guidance: theme
      ? { theme: theme.id, approach: theme.storyApproach }
      : input.customGuidance
        ? { parentDescription: input.customGuidance, instructions: principles.customGuidance.instructions }
        : 'none – just a wonderful story',
  };

  const user = [
    'Create one story from these wishes. The child’s interests are the doorway into the story world.',
    'If guidance is given, weave it in gently through a supporting character, metaphor and a small realistic success. The child must feel: "this story was made for me", never "someone is trying to fix me".',
    '',
    JSON.stringify(wishes, null, 2),
  ].join('\n');

  return { system, user, band };
}

export function parseStoryJson(text) {
  const clean = String(text).replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  const data = JSON.parse(clean.slice(start, end + 1));
  if (typeof data.title !== 'string' || typeof data.story !== 'string') throw new Error('missing fields');
  return {
    title: data.title.trim(),
    summary: String(data.summary ?? '').trim(),
    story: data.story.replace(/\r/g, '').trim(),
    coverPrompt: String(data.coverPrompt ?? '').trim(),
    language: data.language,
  };
}
