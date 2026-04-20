const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getOne);
router.post('/', restrictTo('admin', 'gerente'), serviceController.create);
router.put('/:id', restrictTo('admin', 'gerente'), serviceController.update);
router.delete('/:id', restrictTo('admin', 'gerente'), serviceController.remove);

module.exports = router;
