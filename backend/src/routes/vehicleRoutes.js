const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', vehicleController.getAll);
router.get('/plate/:plate', vehicleController.getByPlate);
router.get('/:id', validateObjectId, vehicleController.getOne);
router.post('/', vehicleController.create);
router.put('/:id', validateObjectId, vehicleController.update);
router.delete('/:id', validateObjectId, vehicleController.remove);

module.exports = router;
