const Jsa = require('../models/jsa.model');
const Risk = require('../models/risk.model');

function validateScore(name, value) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 5) {
    const error = new Error(`${name} must be an integer from 1 to 5`);
    error.statusCode = 400;
    throw error;
  }

  return numberValue;
}

function validateHazard(hazard) {
  if (!hazard || !String(hazard).trim()) {
    const error = new Error('Hazard is required');
    error.statusCode = 400;
    throw error;
  }

  return String(hazard).trim();
}

async function createRisk(userId, { jsa_id, jsaId, hazard, likelihood, severity }) {
  const linkedJsaId = Number(jsa_id || jsaId);

  if (!Number.isInteger(linkedJsaId) || linkedJsaId < 1) {
    const error = new Error('Valid jsa_id is required');
    error.statusCode = 400;
    throw error;
  }

  const jsa = await Jsa.findJsaDocumentById(linkedJsaId);
  if (!jsa) {
    const error = new Error('Linked JSA document not found');
    error.statusCode = 404;
    throw error;
  }

  const cleanHazard = validateHazard(hazard);
  const cleanLikelihood = validateScore('Likelihood', likelihood);
  const cleanSeverity = validateScore('Severity', severity);
  const riskScore = cleanLikelihood * cleanSeverity;

  return Risk.createRiskAssessment({
    jsaId: linkedJsaId,
    hazard: cleanHazard,
    likelihood: cleanLikelihood,
    severity: cleanSeverity,
    riskScore,
    createdBy: userId,
  });
}

async function listRisk() {
  return Risk.listRiskAssessments();
}

async function getRiskById(id) {
  const risk = await Risk.findRiskAssessmentById(id);
  if (!risk) {
    const error = new Error('Risk assessment not found');
    error.statusCode = 404;
    throw error;
  }

  return risk;
}

module.exports = {
  createRisk,
  listRisk,
  getRiskById,
};
