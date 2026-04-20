const Inventory = require('../models/Inventory');

exports.getAll = async (req, res) => {
  try {
    const { lowStock } = req.query;
    const items = await Inventory.find().sort({ name: 1 });
    if (lowStock === 'true') {
      return res.json(items.filter(i => i.stock <= i.minStock));
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener inventario', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Artículo no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener artículo', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear artículo', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { movements, ...data } = req.body;
    const item = await Inventory.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Artículo no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar artículo', error: err.message });
  }
};

exports.addMovement = async (req, res) => {
  try {
    const { type, quantity, reason } = req.body;
    if (!type || !quantity) {
      return res.status(400).json({ message: 'Tipo y cantidad son requeridos' });
    }
    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser un número positivo' });
    }

    const movement = { type, quantity: numQty, reason, user: req.user._id, date: new Date() };

    let item;
    if (type === 'salida') {
      // Atomic check-and-decrement to prevent negative stock race conditions
      item = await Inventory.findOneAndUpdate(
        { _id: req.params.id, stock: { $gte: numQty } },
        { $inc: { stock: -numQty }, $push: { movements: movement } },
        { new: true }
      );
      if (!item) {
        const exists = await Inventory.exists({ _id: req.params.id });
        if (!exists) return res.status(404).json({ message: 'Artículo no encontrado' });
        return res.status(400).json({ message: 'Stock insuficiente' });
      }
    } else {
      item = await Inventory.findByIdAndUpdate(
        req.params.id,
        { $inc: { stock: numQty }, $push: { movements: movement } },
        { new: true }
      );
      if (!item) return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar movimiento', error: err.message });
  }
};
