const express = require('express');
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/risk-analysis', aiController.riskAnalysis);
router.post('/deepseek', aiController.deepseekManual);
router.post('/mistral', aiController.mistralManual);
router.post('/gemma', aiController.gemmaManual);
router.post('/phi3', aiController.phi3Manual);
router.post('/full-analysis', aiController.fullAnalysis);

module.exports = router;
