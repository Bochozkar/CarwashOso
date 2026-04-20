const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');
const { protect } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', processController.getAll);
router.get('/:id', validateObjectId, processController.getOne);
router.post('/', processController.create);
router.put('/:id', validateObjectId, processController.update);

module.exports = router;
