const Client = require('../models/Client');
const escapeRegex = require('../utils/escapeRegex');

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? { $or: [
          { name: new RegExp(escapeRegex(search), 'i') },
          { phone: new RegExp(escapeRegex(search), 'i') },
          { email: new RegExp(escapeRegex(search), 'i') }
        ]}
      : {};
    const clients = await Client.find(query).sort({ name: 1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener clientes', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener cliente', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear cliente', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = String(req.params.id);
    const client = await Client.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar cliente', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = String(req.params.id);
    const client = await Client.findByIdAndDelete(id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar cliente', error: err.message });
  }
};
