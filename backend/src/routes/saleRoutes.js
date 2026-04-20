const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { protect, restrictTo } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', saleController.getAll);
router.get('/:id', validateObjectId, saleController.getOne);
router.post('/', saleController.create);
router.put('/:id', validateObjectId, saleController.update);
router.delete('/:id', validateObjectId, restrictTo('admin', 'gerente'), saleController.remove);
router.put('/:id/cancel', validateObjectId, saleController.cancel);
router.post('/:id/rain-guarantee', validateObjectId, saleController.rainGuarantee);

module.exports = router;
