const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { protect } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', clientController.getAll);
router.get('/:id', validateObjectId, clientController.getOne);
router.post('/', clientController.create);
router.put('/:id', validateObjectId, clientController.update);
router.delete('/:id', validateObjectId, clientController.remove);

module.exports = router;
