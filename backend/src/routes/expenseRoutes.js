const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', expenseController.getAll);
router.get('/:id', expenseController.getOne);
router.post('/', upload.single('image'), expenseController.create);
router.put('/:id', upload.single('image'), expenseController.update);
router.delete('/:id', restrictTo('admin', 'gerente'), expenseController.remove);

module.exports = router;
