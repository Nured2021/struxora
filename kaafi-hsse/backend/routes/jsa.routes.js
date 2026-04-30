const express = require('express');
const jsaController = require('../controllers/jsa.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', jsaController.create);
router.get('/', jsaController.list);
router.get('/:id', jsaController.getById);

module.exports = router;
