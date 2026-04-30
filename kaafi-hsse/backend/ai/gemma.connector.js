const OLLAMA_GENERATE_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'gemma:7b';

async function generate(text) {
  if (!text || !String(text).trim()) {
    const error = new Error('Text is required');
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch(OLLAMA_GENERATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt: String(text).trim(),
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = new Error('Gemma request failed');
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();

  return {
    model: MODEL_NAME,
    response: String(data.response || '').trim(),
  };
}

module.exports = {
  generate,
};
