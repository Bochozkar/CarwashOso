const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', expenseController.getAll);
router.get('/:id', validateObjectId, expenseController.getOne);
router.post('/', upload.single('image'), expenseController.create);
router.put('/:id', validateObjectId, upload.single('image'), expenseController.update);
router.delete('/:id', validateObjectId, restrictTo('admin', 'gerente'), expenseController.remove);

module.exports = router;
