const deepseek = require('../ai/deepseek.connector');

async function riskAnalysis(req, res, next) {
  try {
    const text = req.body?.text;

    if (!text || !String(text).trim()) {
      const error = new Error('text is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await deepseek.analyzeRisk(String(text).trim());
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  riskAnalysis,
};
