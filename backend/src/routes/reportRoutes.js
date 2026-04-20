const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin', 'gerente'));
router.get('/daily', reportController.daily);
router.get('/range', reportController.range);

module.exports = router;
