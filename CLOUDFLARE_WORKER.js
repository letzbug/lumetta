export default {
  async fetch(request, env) {
    const allowedOrigin = "https://letzbug.github.io";
    const cors = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/health" || url.pathname === "/")) {
      return Response.json({
        story: Boolean(env.MISTRAL_API_KEY), image: false, tts: Boolean(env.XAI_API_KEY),
        providers: { story: env.MISTRAL_API_KEY ? "mistral" : "demo", image: "demo", tts: env.XAI_API_KEY ? "xai" : "browser" },
      }, { headers: cors });
    }

    if (request.method === "POST" && url.pathname === "/tts") {
      if (!env.XAI_API_KEY) return Response.json({ error: "tts_unavailable" }, { status: 503, headers: cors });
      try {
        const body = await request.json();
        const text = String(body.text ?? "").trim();
        if (!text) return Response.json({ error: "empty_text" }, { status: 400, headers: cors });
        const allowedVoices = ["ara", "eve", "leo", "rex", "sal"];
        const requestedVoice = String(body.voice || body.voiceId || body.voice_id || "eve").toLowerCase();
        const voice = allowedVoices.includes(requestedVoice) ? requestedVoice : "eve";
        const speed = Math.max(0.7, Math.min(1.5, Number(body.speed) || 1));
        const language = String(body.language || "auto");
        const withTimestamps = body.withTimestamps === true;
        const xai = await fetch("https://api.x.ai/v1/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.XAI_API_KEY}` },
          body: JSON.stringify({
            text: text.slice(0, 15000), voice_id: voice, language, speed,
            with_timestamps: withTimestamps,
            output_format: { codec: "mp3", sample_rate: 24000, bit_rate: 128000 },
          }),
        });
        if (!xai.ok) {
          const detail = await xai.text(); console.error("xAI TTS error", xai.status, detail);
          return Response.json({ error: "tts_provider_failed", status: xai.status }, { status: 502, headers: cors });
        }
        if (withTimestamps) {
          const data = await xai.json();
          return Response.json(data, { headers: { ...cors, "Cache-Control": "private, max-age=3600" } });
        }
        const audio = await xai.arrayBuffer();
        return new Response(audio, { status: 200, headers: { ...cors, "Content-Type": xai.headers.get("Content-Type") || "audio/mpeg", "Cache-Control": "private, max-age=3600" } });
      } catch (error) {
        console.error("Lumetta TTS error", error);
        return Response.json({ error: "tts_service_error" }, { status: 500, headers: cors });
      }
    }

    if (request.method === "POST" && url.pathname === "/llm") {
      if (!env.MISTRAL_API_KEY) return Response.json({ error: "engine_unavailable" }, { status: 503, headers: cors });
      try {
        const body = await request.json();
        const system = String(body.system ?? "").slice(0, 24000);
        const user = String(body.user ?? "").slice(0, 48000);
        if (!system || !user) return Response.json({ error: "empty_prompt" }, { status: 400, headers: cors });
        const payload = {
          model: "mistral-small-latest",
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
          temperature: Math.min(1.2, Math.max(0, Number(body.temperature) || 0.7)),
          max_tokens: Math.min(4000, Math.max(200, Number(body.maxTokens) || 2000)),
        };
        if (body.json !== false) payload.response_format = { type: "json_object" };
        const mistral = await fetch("https://api.eu.mistral.ai/v1/chat/completions", {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.MISTRAL_API_KEY}` }, body: JSON.stringify(payload),
        });
        if (!mistral.ok) {
          const detail = await mistral.text(); console.error("Mistral error", mistral.status, detail);
          return Response.json({ error: "provider_failed", status: mistral.status }, { status: 502, headers: cors });
        }
        const data = await mistral.json(); const text = data?.choices?.[0]?.message?.content;
        if (typeof text !== "string" || !text.trim()) return Response.json({ error: "empty_model_response" }, { status: 502, headers: cors });
        return Response.json({ text }, { headers: cors });
      } catch (error) {
        console.error("Lumetta Story API error", error);
        return Response.json({ error: "story_service_error" }, { status: 500, headers: cors });
      }
    }
    return Response.json({ error: "not_found" }, { status: 404, headers: cors });
  },
};
