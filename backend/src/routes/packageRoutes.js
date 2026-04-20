const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { protect, restrictTo } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', packageController.getAll);
router.get('/:id', validateObjectId, packageController.getOne);
router.post('/', restrictTo('admin', 'gerente'), packageController.create);
router.put('/:id', validateObjectId, restrictTo('admin', 'gerente'), packageController.update);
router.delete('/:id', validateObjectId, restrictTo('admin', 'gerente'), packageController.remove);

module.exports = router;
