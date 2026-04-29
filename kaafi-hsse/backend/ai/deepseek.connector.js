const OLLAMA_GENERATE_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'deepseek-r1:7b';

function extractSection(text, sectionName) {
  const pattern = new RegExp(`${sectionName}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*(hazards|risks|controls)\\s*:?|$)`, 'i');
  const match = text.match(pattern);

  if (!match) return [];

  return match[1]
    .split('\n')
    .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean);
}

function parseAnalysis(text, originalText) {
  const hazards = extractSection(text, 'hazards');
  const risks = extractSection(text, 'risks');
  const controls = extractSection(text, 'controls');

  return {
    hazards: hazards.length ? hazards : [originalText],
    risks: risks.length ? risks : [text],
    controls,
  };
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
      prompt: `Analyze this hazard and return risks and controls: ${input}`,
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

  return {
    ...parseAnalysis(generatedText, input),
  };
}

module.exports = {
  analyzeRisk,
};
