const express = require('express');
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/risk-analysis', aiController.riskAnalysis);

module.exports = router;
