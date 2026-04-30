const deepseek = require('../ai/deepseek.connector');
const gemma = require('../ai/gemma.connector');
const mistral = require('../ai/mistral.connector');
const pipeline = require('../ai/pipeline.service');
const phi3 = require('../ai/phi3.connector');

function requireText(req) {
  const text = req.body?.text;

  if (!text || !String(text).trim()) {
    const error = new Error('text is required');
    error.statusCode = 400;
    throw error;
  }

  return String(text).trim();
}

async function riskAnalysis(req, res, next) {
  try {
    const result = await deepseek.analyzeRisk(requireText(req));
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deepseekManual(req, res, next) {
  try {
    return res.json(await deepseek.analyzeRisk(requireText(req)));
  } catch (error) {
    return next(error);
  }
}

async function mistralManual(req, res, next) {
  try {
    return res.json(await mistral.generate(requireText(req)));
  } catch (error) {
    return next(error);
  }
}

async function gemmaManual(req, res, next) {
  try {
    return res.json(await gemma.generate(requireText(req)));
  } catch (error) {
    return next(error);
  }
}

async function phi3Manual(req, res, next) {
  try {
    return res.json(await phi3.generate(requireText(req)));
  } catch (error) {
    return next(error);
  }
}

async function fullAnalysis(req, res, next) {
  try {
    return res.json(await pipeline.runPipeline(requireText(req)));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  riskAnalysis,
  deepseekManual,
  mistralManual,
  gemmaManual,
  phi3Manual,
  fullAnalysis,
};
