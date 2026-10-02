import data from './ageProfiles.json';

export interface AgeBand {
  id: 'little' | 'middle' | 'older';
  minAge: number;
  maxAge: number;
  wordsTarget: [number, number];
  wpm: number;
  ttsRate: number;
  sentenceLength: string;
  vocabulary: string;
  emotionalComplexity: string;
  structure: string;
}

const bands = data.bands as unknown as AgeBand[];

export function ageBand(age: number): AgeBand {
  return bands.find((b) => age >= b.minAge && age <= b.maxAge) ?? bands[1];
}

export function estimateDurationSeconds(text: string, age: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.round((words / ageBand(age).wpm) * 60);
}
