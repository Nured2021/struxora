const deepseek = require('./deepseek.connector');
const gemma = require('./gemma.connector');
const mistral = require('./mistral.connector');
const phi3 = require('./phi3.connector');

function emptyResult() {
  return {
    hazard: [],
    risk: [],
    controls: [],
    jsa: '',
    ptw: '',
    document_check: '',
    summary: '',
  };
}

async function safeStep(fn, fallback) {
  try {
    return await fn();
  } catch (_error) {
    return fallback;
  }
}

function textResponse(result) {
  return result?.response || '';
}

async function runPipeline(input) {
  if (!input || !String(input).trim()) {
    const error = new Error('Text is required');
    error.statusCode = 400;
    throw error;
  }

  const text = String(input).trim();
  const output = emptyResult();

  const hazardResult = await safeStep(
    () => deepseek.analyzeRisk(`Detect hazards from this work activity: ${text}`),
    { hazards: [] },
  );
  output.hazard = hazardResult.hazards || [];

  const riskResult = await safeStep(
    () => deepseek.analyzeRisk(`Analyze risks for this work activity: ${text}`),
    { risks: [] },
  );
  output.risk = riskResult.risks || [];

  const controlResult = await safeStep(
    () => deepseek.analyzeRisk(`Suggest controls for this work activity: ${text}`),
    { controls: [] },
  );
  output.controls = controlResult.controls || [];

  output.jsa = textResponse(
    await safeStep(
      () => mistral.generate(`Draft a simple JSA for this work activity: ${text}`),
      { response: '' },
    ),
  );

  output.ptw = textResponse(
    await safeStep(
      () => mistral.generate(`Suggest basic Permit to Work support notes for this work activity: ${text}`),
      { response: '' },
    ),
  );

  output.document_check = textResponse(
    await safeStep(
      () => gemma.generate(`Check what documents or procedures should be reviewed for this work activity: ${text}`),
      { response: '' },
    ),
  );

  output.summary = textResponse(
    await safeStep(
      () => phi3.generate(`Summarize this HSSE analysis in a short practical note: ${text}`),
      { response: '' },
    ),
  );

  return output;
}

module.exports = {
  runPipeline,
};
