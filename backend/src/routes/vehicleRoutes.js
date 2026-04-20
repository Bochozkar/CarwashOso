const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', vehicleController.getAll);
router.get('/plate/:plate', vehicleController.getByPlate);
router.get('/:id', vehicleController.getOne);
router.post('/', vehicleController.create);
router.put('/:id', vehicleController.update);
router.delete('/:id', vehicleController.remove);

module.exports = router;
