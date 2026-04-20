const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.get('/', inventoryController.getAll);
router.get('/:id', inventoryController.getOne);
router.post('/', restrictTo('admin', 'gerente'), inventoryController.create);
router.put('/:id', restrictTo('admin', 'gerente'), inventoryController.update);
router.post('/:id/movement', inventoryController.addMovement);

module.exports = router;
