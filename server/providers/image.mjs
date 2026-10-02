/** Cover illustration providers. Returns a data: URL. */
const PROVIDERS = {
  async openai({ key, model }, prompt) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: model || 'gpt-image-1', prompt, size: '1024x1536', n: 1 }),
    });
    if (!res.ok) throw new Error(`openai image ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error('no image returned');
    return `data:image/png;base64,${b64}`;
  },
};

export async function generateCover(cfg, prompt) {
  const fn = PROVIDERS[cfg.provider];
  if (!fn) throw new Error(`unknown image provider ${cfg.provider}`);
  return fn(cfg, prompt.slice(0, 3800));
}
