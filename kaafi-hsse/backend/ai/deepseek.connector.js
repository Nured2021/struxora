const OLLAMA_GENERATE_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'deepseek-r1:7b';
const PARSE_FALLBACK = {
  hazards: [],
  risks: [],
  controls: ['Unable to parse AI response'],
};

function toStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function extractJson(text) {
  const trimmed = String(text || '')
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found');
  }

  return trimmed.slice(start, end + 1);
}

function parseAnalysis(text) {
  try {
    const parsed = JSON.parse(extractJson(text));

    return {
      hazards: toStringArray(parsed.hazards),
      risks: toStringArray(parsed.risks),
      controls: toStringArray(parsed.controls),
    };
  } catch (_error) {
    return { ...PARSE_FALLBACK };
  }
}

function buildPrompt(input) {
  return `Analyze the following hazard and respond ONLY in JSON format with keys: hazards, risks, controls. No explanation. Hazard: ${input}`;
}

async function analyzeRisk(text) {
  if (!text || !String(text).trim()) {
    const error = new Error('Text is required');
    error.statusCode = 400;
    throw error;
  }

  const input = String(text).trim();
  const response = await fetch(OLLAMA_GENERATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt: buildPrompt(input),
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = new Error('DeepSeek risk analysis failed');
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const generatedText = String(data.response || '').trim();

  if (!generatedText) {
    const error = new Error('DeepSeek returned an empty response');
    error.statusCode = 502;
    throw error;
  }

  return parseAnalysis(generatedText);
}

module.exports = {
  analyzeRisk,
};
