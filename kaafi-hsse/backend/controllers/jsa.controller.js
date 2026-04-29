const jsaService = require('../services/jsa.service');

async function create(req, res, next) {
  try {
    const result = await jsaService.createJsa(req.user.sub, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function list(_req, res, next) {
  try {
    const result = await jsaService.listJsa();
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const result = await jsaService.getJsaById(req.params.id);
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
