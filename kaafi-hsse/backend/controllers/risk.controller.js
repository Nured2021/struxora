const riskService = require('../services/risk.service');

async function create(req, res, next) {
  try {
    const result = await riskService.createRisk(req.user.sub, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function list(_req, res, next) {
  try {
    const result = await riskService.listRisk();
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const result = await riskService.getRiskById(req.params.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
  getById,
};
