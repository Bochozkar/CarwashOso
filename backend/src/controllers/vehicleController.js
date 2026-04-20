const Vehicle = require('../models/Vehicle');

exports.getAll = async (req, res) => {
  try {
    const { client, search } = req.query;
    const query = {};
    if (client) query.client = client;
    if (search) {
      query.$or = [
        { plate: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { color: new RegExp(search, 'i') }
      ];
    }
    const vehicles = await Vehicle.find(query).populate('client').sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener vehículos', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('client');
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener vehículo', error: err.message });
  }
};

exports.getByPlate = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ plate: req.params.plate.toUpperCase() }).populate('client');
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar vehículo', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(await vehicle.populate('client'));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'La placa ya está registrada' });
    }
    res.status(500).json({ message: 'Error al crear vehículo', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('client');
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(vehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'La placa ya está registrada' });
    }
    res.status(500).json({ message: 'Error al actualizar vehículo', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar vehículo', error: err.message });
  }
};
