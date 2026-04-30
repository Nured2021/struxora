const express = require('express');
const riskController = require('../controllers/risk.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', riskController.create);
router.get('/', riskController.list);
router.get('/:id', riskController.getById);

module.exports = router;
