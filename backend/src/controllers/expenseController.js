const Expense = require('../models/Expense');

exports.getAll = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const query = {};
    if (category) query.category = String(category);
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    const expenses = await Expense.find(query).populate('registeredBy').sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener gastos', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('registeredBy');
    if (!expense) return res.status(404).json({ message: 'Gasto no encontrado' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener gasto', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = { ...req.body, registeredBy: req.user._id };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const expense = await Expense.create(data);
    res.status(201).json(await expense.populate('registeredBy'));
  } catch (err) {
    res.status(500).json({ message: 'Error al crear gasto', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const id = String(req.params.id);
    const expense = await Expense.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('registeredBy');
    if (!expense) return res.status(404).json({ message: 'Gasto no encontrado' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar gasto', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = String(req.params.id);
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) return res.status(404).json({ message: 'Gasto no encontrado' });
    res.json({ message: 'Gasto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar gasto', error: err.message });
  }
};
