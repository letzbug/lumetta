/** Lower-case and strip accents/umlauts, for keyword matching across languages. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss');
}

export interface Segment {
  index: number;
  paragraph: number;
  text: string;
  /** Character offsets across the whole story (used for timing). */
  start: number;
  end: number;
}

/** Split paragraphs into sentences – the unit for narration and read-along highlighting. */
export function segmentStory(paragraphs: string[]): Segment[] {
  const segments: Segment[] = [];
  let offset = 0;
  paragraphs.forEach((p, pi) => {
    const parts = p
      .split(/(?<=[.!?…][“”"»«']?)\s+(?=[^\s])/u)
      .map((s) => s.trim())
      .filter(Boolean);
    // merge very short fragments (e.g. "Klick!") into the previous sentence for smoother speech
    const merged: string[] = [];
    for (const part of parts) {
      if (merged.length && part.length < 12) merged[merged.length - 1] += ' ' + part;
      else merged.push(part);
    }
    for (const text of merged) {
      segments.push({ index: segments.length, paragraph: pi, text, start: offset, end: offset + text.length });
      offset += text.length + 1;
    }
  });
  return segments;
}

export function splitParagraphs(story: string): string[] {
  return story
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}


/** Remove expressive TTS direction tags while preserving every story word. */
export function stripVoiceCues(text: string): string {
  return text
    .replace(/\[(?:pause|whisper|softly|excited|surprised|sad|giggle|laugh|calm|warmly|slowly)\]/gi, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
