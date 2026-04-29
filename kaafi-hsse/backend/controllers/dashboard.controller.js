const dashboardService = require('../services/dashboard.service');

async function getSummary(_req, res, next) {
  try {
    const result = await dashboardService.getDashboardSummary();
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSummary,
};
