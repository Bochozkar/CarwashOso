const Process = require('../models/Process');

exports.getAll = async (req, res) => {
  try {
    const { status, vehicle } = req.query;
    const query = {};
    if (status) query.status = String(status);
    if (vehicle) query.vehicle = String(vehicle);
    const processes = await Process.find(query)
      .populate('sale vehicle assignedEmployees')
      .sort({ createdAt: -1 });
    res.json(processes);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener procesos', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const process = await Process.findById(req.params.id)
      .populate('sale vehicle assignedEmployees');
    if (!process) return res.status(404).json({ message: 'Proceso no encontrado' });
    res.json(process);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener proceso', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const process = await Process.create(req.body);
    res.status(201).json(await process.populate('sale vehicle assignedEmployees'));
  } catch (err) {
    res.status(500).json({ message: 'Error al crear proceso', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { status, assignedEmployees, notes } = req.body;
    const existing = await Process.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Proceso no encontrado' });

    if (status) {
      if (status === 'proceso' && existing.status === 'espera') {
        existing.assignedAt = new Date();
      }
      if (status === 'terminado' && existing.status !== 'terminado') {
        existing.finishedAt = new Date();
      }
      existing.status = status;
    }
    if (assignedEmployees !== undefined) existing.assignedEmployees = assignedEmployees;
    if (notes !== undefined) existing.notes = notes;

    await existing.save();
    res.json(await existing.populate('sale vehicle assignedEmployees'));
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar proceso', error: err.message });
  }
};
