const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.get('/', packageController.getAll);
router.get('/:id', packageController.getOne);
router.post('/', restrictTo('admin', 'gerente'), packageController.create);
router.put('/:id', restrictTo('admin', 'gerente'), packageController.update);
router.delete('/:id', restrictTo('admin', 'gerente'), packageController.remove);

module.exports = router;
