/**
 * Groq AI Client
 * Provides high-speed LLM inference for Local SEO text optimization.
 */

const fs = require('fs');
const path = require('path');

// Auto-load .env if not loaded
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim();
        }
      }
    }
  }
}

loadEnv();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

/**
 * Calls Groq chat completion API.
 * @param {Array} messages - [{ role, content }]
 * @param {Object} [options] - { model, temperature, maxTokens, jsonMode, apiKey }
 * @returns {Promise<string>} Generated text
 */
async function callGroq(messages, options = {}) {
  const apiKey = options.apiKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined. Please set it in .env or pass it in options.');
  }

  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 1024;

  const payload = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  };

  if (options.jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();

    // If json_mode failed, retry without json_object enforcement
    if (options.jsonMode && errorText.includes('json_validate_failed')) {
      return callGroq(messages, { ...options, jsonMode: false });
    }

    // If primary model encounters rate limits or availability issues, fallback to qwen
    if (model !== 'qwen/qwen3.8-27b' && (res.status === 429 || res.status === 503)) {
      console.warn(`[GroqClient] Falling back to qwen/qwen3.8-27b due to ${res.status}`);
      return callGroq(messages, { ...options, model: 'qwen/qwen3.8-27b' });
    }

    throw new Error(`Groq API Error (${res.status}): ${errorText}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() || '';
}

module.exports = {
  callGroq,
  DEFAULT_MODEL
};
