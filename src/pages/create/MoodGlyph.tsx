import type { ReactElement } from 'react';
import type { StoryMood } from '../../types/story';

/** Small hand-drawn glyphs for the story kinds (decorative). */
const GLYPHS: Record<StoryMood, ReactElement> = {
  adventure: <path d="M6 34 L18 14 L25 24 L30 17 L42 34 Z M18 14 l3 -6 l3 4" />,
  funny: <path d="M14 20 q2 -3 4 0 M30 20 q2 -3 4 0 M14 28 q10 9 20 0" />,
  calm: <path d="M6 22 q6 -6 12 0 t12 0 t12 0 M6 30 q6 -6 12 0 t12 0 t12 0" />,
  magical: <path d="M24 6 c1.5 9 4 11.5 13 13 c-9 1.5 -11.5 4 -13 13 c-1.5 -9 -4 -11.5 -13 -13 c9 -1.5 11.5 -4 13 -13 Z M38 31 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4 Z" />,
  discovery: <path d="M21 9 a11 11 0 1 1 0 22 a11 11 0 1 1 0 -22 Z M29 28 L40 39" />,
  bedtime: <path d="M30 8 a14 14 0 1 0 10 22 a11 11 0 0 1 -10 -22 Z M12 10 l1 2.5 2.5 1 -2.5 1 -1 2.5 -1 -2.5 -2.5 -1 2.5 -1 Z" />,
  surprise: <path d="M8 20 h32 v18 h-32 Z M6 14 h36 v6 h-36 Z M24 14 v24 M24 14 c-4 -8 -12 -6 -9 0 M24 14 c4 -8 12 -6 9 0" />,
};

export function MoodGlyph({ mood }: { mood: StoryMood }) {
  return (
    <svg viewBox="0 0 48 44" width="48" height="44" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {GLYPHS[mood]}
    </svg>
  );
}
