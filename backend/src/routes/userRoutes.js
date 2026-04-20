const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.get('/', userController.getAll);
router.get('/:id', userController.getOne);
router.post('/', restrictTo('admin', 'gerente'), userController.create);
router.put('/:id', restrictTo('admin', 'gerente'), userController.update);
router.delete('/:id', restrictTo('admin'), userController.remove);

module.exports = router;
