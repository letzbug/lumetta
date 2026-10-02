/**
 * Narration providers. Returns an MP3 Buffer.
 * Voice ids per storyteller voice come from .env (TTS_VOICE_*), with sensible defaults.
 * Luxembourgish: enable only once a provider offers a natural lb-LU voice.
 */
const DEFAULT_VOICES = {
  openai: { 'warm-female': 'coral', 'warm-male': 'ash', neutral: 'fable' },
  elevenlabs: {},
};

const STYLE = 'Read like a warm, calm storyteller reading a picture book to a young child. Gentle pace, natural pauses between paragraphs, soft and kind voice, playful for sound words.';

/** Split long text at paragraph/sentence boundaries; MP3 chunks can be concatenated. */
function chunks(text, max) {
  const parts = [];
  let current = '';
  for (const piece of text.split(/(?<=\n\n)|(?<=[.!?…]["“”»]?\s)/)) {
    if ((current + piece).length > max && current) {
      parts.push(current.trim());
      current = '';
    }
    current += piece;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const PROVIDERS = {
  async openai({ key, model, voices }, { text, voiceId, rate }) {
    const voice = voices[voiceId] || DEFAULT_VOICES.openai[voiceId] || 'coral';
    const buffers = [];
    for (const input of chunks(text, 3800)) {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: model || 'gpt-4o-mini-tts', voice, input, instructions: STYLE, response_format: 'mp3', speed: rate }),
      });
      if (!res.ok) throw new Error(`openai tts ${res.status}: ${await res.text()}`);
      buffers.push(Buffer.from(await res.arrayBuffer()));
    }
    return Buffer.concat(buffers);
  },

  async elevenlabs({ key, model, voices }, { text, voiceId }) {
    const voice = voices[voiceId] || voices.neutral;
    if (!voice) throw new Error('set TTS_VOICE_* ids for ElevenLabs');
    const buffers = [];
    for (const input of chunks(text, 4500)) {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': key },
        body: JSON.stringify({ text: input, model_id: model || 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.75 } }),
      });
      if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${await res.text()}`);
      buffers.push(Buffer.from(await res.arrayBuffer()));
    }
    return Buffer.concat(buffers);
  },
};

export async function synthesize(cfg, request) {
  const fn = PROVIDERS[cfg.provider];
  if (!fn) throw new Error(`unknown tts provider ${cfg.provider}`);
  return fn(cfg, request);
}
