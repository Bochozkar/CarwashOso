const Package = require('../models/Package');

exports.getAll = async (req, res) => {
  try {
    const { active } = req.query;
    const query = active !== undefined ? { active: active === 'true' } : {};
    const packages = await Package.find(query).populate('services').sort({ name: 1 });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener paquetes', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id).populate('services');
    if (!pkg) return res.status(404).json({ message: 'Paquete no encontrado' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener paquete', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json(await pkg.populate('services'));
  } catch (err) {
    res.status(500).json({ message: 'Error al crear paquete', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = String(req.params.id);
    const pkg = await Package.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate('services');
    if (!pkg) return res.status(404).json({ message: 'Paquete no encontrado' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar paquete', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = String(req.params.id);
    const pkg = await Package.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Paquete no encontrado' });
    res.json({ message: 'Paquete desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar paquete', error: err.message });
  }
};
