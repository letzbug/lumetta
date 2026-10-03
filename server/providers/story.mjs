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

/**
 * Generic completion used by Story Engine V2 (POST /api/llm).
 * opts: { system, user, json, temperature, maxTokens }
 */
export async function complete(cfg, { system, user, json = true, temperature = 0.7, maxTokens = 2000 }) {
  if (cfg.provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: cfg.model || 'claude-sonnet-5-5', max_tokens: maxTokens, temperature: Math.min(1, temperature), system, messages: [{ role: 'user', content: user }] }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return (data.content ?? []).map((c) => (c.type === 'text' ? c.text : '')).join('');
  }
  const endpoint = cfg.provider === 'mistral' ? 'https://api.mistral.ai/v1/chat/completions' : cfg.provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : null;
  if (!endpoint) throw new Error(`unknown story provider ${cfg.provider}`);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({
      model: cfg.model || (cfg.provider === 'mistral' ? 'mistral-large-latest' : 'gpt-4.1'),
      temperature,
      max_tokens: maxTokens,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${cfg.provider} ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function generateStoryText(cfg, prompt) {
  const fn = PROVIDERS[cfg.provider];
  if (!fn) throw new Error(`unknown story provider ${cfg.provider}`);
  return fn(cfg, prompt);
}
