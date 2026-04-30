const Jsa = require('../models/jsa.model');
const Risk = require('../models/risk.model');
const Ptw = require('../models/ptw.model');

const VALID_PERMIT_TYPES = ['hot_work', 'confined_space', 'electrical', 'work_at_height', 'excavation', 'general'];

function readId(body, snakeName, camelName) {
  const value = body[snakeName] || body[camelName];
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 1) {
    const error = new Error(`Valid ${snakeName} is required`);
    error.statusCode = 400;
    throw error;
  }

  return numberValue;
}

function validatePermitType(permitType) {
  if (!permitType || !VALID_PERMIT_TYPES.includes(permitType)) {
    const error = new Error(`permit_type must be one of: ${VALID_PERMIT_TYPES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return permitType;
}

function validateText(name, value) {
  if (!value || !String(value).trim()) {
    const error = new Error(`${name} is required`);
    error.statusCode = 400;
    throw error;
  }

  return String(value).trim();
}

function validateDate(name, value) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    const error = new Error(`${name} must be a valid date/time`);
    error.statusCode = 400;
    throw error;
  }

  return date;
}

async function createPtw(userId, body) {
  const jsaId = readId(body, 'jsa_id', 'jsaId');
  const riskId = readId(body, 'risk_id', 'riskId');

  const jsa = await Jsa.findJsaDocumentById(jsaId);
  if (!jsa) {
    const error = new Error('Linked JSA document not found');
    error.statusCode = 404;
    throw error;
  }

  const risk = await Risk.findRiskAssessmentById(riskId);
  if (!risk) {
    const error = new Error('Linked risk assessment not found');
    error.statusCode = 404;
    throw error;
  }

  if (Number(risk.jsa_id) !== jsaId) {
    const error = new Error('Risk assessment must belong to the linked JSA');
    error.statusCode = 400;
    throw error;
  }

  const startTime = validateDate('start_time', body.start_time || body.startTime);
  const endTime = validateDate('end_time', body.end_time || body.endTime);

  if (endTime <= startTime) {
    const error = new Error('end_time must be after start_time');
    error.statusCode = 400;
    throw error;
  }

  return Ptw.createPtwPermit({
    jsaId,
    riskId,
    permitType: validatePermitType(body.permit_type || body.permitType),
    description: validateText('description', body.description),
    startTime,
    endTime,
    createdBy: userId,
  });
}

async function listPtw() {
  return Ptw.listPtwPermits();
}

async function getPtwById(id) {
  const permit = await Ptw.findPtwPermitById(id);
  if (!permit) {
    const error = new Error('Permit to Work not found');
    error.statusCode = 404;
    throw error;
  }

  return permit;
}

module.exports = {
  createPtw,
  listPtw,
  getPtwById,
  VALID_PERMIT_TYPES,
};
