const Service = require('../models/Service');

exports.getAll = async (req, res) => {
  try {
    const { type, active } = req.query;
    const query = {};
    if (type) query.type = type;
    if (active !== undefined) query.active = active === 'true';
    const services = await Service.find(query).sort({ name: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener servicios', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener servicio', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear servicio', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar servicio', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json({ message: 'Servicio desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar servicio', error: err.message });
  }
};
