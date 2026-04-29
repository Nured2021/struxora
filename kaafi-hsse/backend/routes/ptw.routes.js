const express = require('express');
const ptwController = require('../controllers/ptw.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', ptwController.create);
router.get('/', ptwController.list);
router.get('/:id', ptwController.getById);

module.exports = router;
