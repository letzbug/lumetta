import type { LlmProvider } from './provider';
import { validateFingerprint, type Architecture, type Candidate, type StoryFingerprint, type WrittenStory } from './schemas';

const KEY = 'lumetta.fingerprints.v1';
const KEEP = 8;

/** Privacy-minimised: no names, no text, no personal details. */
export function localFingerprint(candidate: Candidate | undefined, arch: Architecture | undefined): StoryFingerprint {
  return {
    genre: arch?.storyForm ?? 'story',
    scale: candidate?.scale ?? 'small',
    settingType: (arch?.setting ?? '').split(/[,.;]/)[0].slice(0, 60),
    centralDevice: (candidate?.centralDevice ?? '').slice(0, 80),
    characterTypes: [],
    structureType: arch?.storyForm ?? '',
    endingStyle: (arch?.endingDirection ?? '').slice(0, 60),
    majorMotifs: (arch?.storySpecificDetails ?? []).slice(0, 4).map((d) => d.slice(0, 40)),
  };
}

export async function createFingerprint(
  story: WrittenStory,
  candidate: Candidate | undefined,
  arch: Architecture | undefined,
  provider?: LlmProvider,
): Promise<StoryFingerprint> {
  if (provider) {
    try {
      const fp = await provider.generateStructured('fingerprint', JSON.stringify({ title: story.title, storyForm: arch?.storyForm, centralDevice: candidate?.centralDevice, text: story.text.slice(0, 6000) }), (raw) => {
        const v = validateFingerprint(raw);
        if (!v) throw new Error('invalid fingerprint');
        return v;
      });
      return scrub(fp);
    } catch {
      /* fall back to the local fingerprint */
    }
  }
  return scrub(localFingerprint(candidate, arch));
}

/** Never let the protagonist token or a name slip into a fingerprint. */
function scrub(fp: StoryFingerprint): StoryFingerprint {
  const clean = (s: string) => s.replace(/\{\{HERO\}\}/g, 'child').slice(0, 80);
  return {
    ...fp,
    settingType: clean(fp.settingType),
    centralDevice: clean(fp.centralDevice),
    structureType: clean(fp.structureType),
    endingStyle: clean(fp.endingStyle),
    characterTypes: fp.characterTypes.map(clean),
    majorMotifs: fp.majorMotifs.map(clean),
  };
}

export function loadRecentFingerprints(): StoryFingerprint[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.map(validateFingerprint).filter((f): f is StoryFingerprint => Boolean(f)).slice(0, KEEP) : [];
  } catch {
    return [];
  }
}

export function rememberFingerprint(fp: StoryFingerprint) {
  try {
    localStorage.setItem(KEY, JSON.stringify([fp, ...loadRecentFingerprints()].slice(0, KEEP)));
  } catch {
    /* storage unavailable – repetition avoidance simply has less history */
  }
}
