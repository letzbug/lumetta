/**
 * Story text providers. Add a provider by adding a function here and
 * listing it in config.mjs → capabilities().
 * Recommended for GDPR-first deployments: an EU-based provider (e.g. Mistral)
 * with a data processing agreement and no training on inputs.
 */
const PROVIDERS = {
  async mistral({ key, model }, { system, user }) {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: model || 'mistral-large-latest',
        temperature: 0.85,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`mistral ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  },

  async openai({ key, model }, { system, user }) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: model || 'gpt-4.1',
        temperature: 0.85,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  },

  async anthropic({ key, model }, { system, user }) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: model || 'claude-sonnet-5-5',
        max_tokens: 4000,
        temperature: 0.85,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return (data.content ?? []).map((c) => (c.type === 'text' ? c.text : '')).join('');
  },
};

export async function generateStoryText(cfg, prompt) {
  const fn = PROVIDERS[cfg.provider];
  if (!fn) throw new Error(`unknown story provider ${cfg.provider}`);
  return fn(cfg, prompt);
}
