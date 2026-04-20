const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.get('/', saleController.getAll);
router.get('/:id', saleController.getOne);
router.post('/', saleController.create);
router.put('/:id', saleController.update);
router.delete('/:id', restrictTo('admin', 'gerente'), saleController.remove);
router.put('/:id/cancel', saleController.cancel);
router.post('/:id/rain-guarantee', saleController.rainGuarantee);

module.exports = router;
