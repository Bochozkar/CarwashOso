const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', processController.getAll);
router.get('/:id', processController.getOne);
router.post('/', processController.create);
router.put('/:id', processController.update);

module.exports = router;
