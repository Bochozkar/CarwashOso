const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, restrictTo } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', inventoryController.getAll);
router.get('/:id', validateObjectId, inventoryController.getOne);
router.post('/', restrictTo('admin', 'gerente'), inventoryController.create);
router.put('/:id', validateObjectId, restrictTo('admin', 'gerente'), inventoryController.update);
router.post('/:id/movement', validateObjectId, inventoryController.addMovement);

module.exports = router;
