const ptwService = require('../services/ptw.service');

async function create(req, res, next) {
  try {
    const result = await ptwService.createPtw(req.user.sub, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function list(_req, res, next) {
  try {
    const result = await ptwService.listPtw();
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const result = await ptwService.getPtwById(req.params.id);
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
