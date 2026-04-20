const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', userController.getAll);
router.get('/:id', validateObjectId, userController.getOne);
router.post('/', restrictTo('admin', 'gerente'), userController.create);
router.put('/:id', validateObjectId, restrictTo('admin', 'gerente'), userController.update);
router.delete('/:id', validateObjectId, restrictTo('admin'), userController.remove);

module.exports = router;
