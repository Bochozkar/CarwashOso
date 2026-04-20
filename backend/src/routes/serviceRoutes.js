const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', serviceController.getAll);
router.get('/:id', validateObjectId, serviceController.getOne);
router.post('/', restrictTo('admin', 'gerente'), serviceController.create);
router.put('/:id', validateObjectId, restrictTo('admin', 'gerente'), serviceController.update);
router.delete('/:id', validateObjectId, restrictTo('admin', 'gerente'), serviceController.remove);

module.exports = router;
