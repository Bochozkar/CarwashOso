const Sale = require('../models/Sale');
const Process = require('../models/Process');
const Package = require('../models/Package');
const generateFolio = require('../utils/generateFolio');

exports.getAll = async (req, res) => {
  try {
    const { folio, client, vehicle, status, date } = req.query;
    const query = {};
    if (folio) query.folio = new RegExp(folio, 'i');
    if (client) query.client = client;
    if (vehicle) query.vehicle = vehicle;
    if (status) query.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }
    const sales = await Sale.find(query)
      .populate('client vehicle services packages additionals cashier cancelledBy originalSale')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener ventas', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('client vehicle services packages additionals cashier cancelledBy originalSale');
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener venta', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const folio = await generateFolio();
    const sale = await Sale.create({ ...req.body, folio, cashier: req.user._id });
    await Process.create({ sale: sale._id, vehicle: sale.vehicle });
    const populated = await sale.populate('client vehicle services packages additionals cashier');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear venta', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { folio, cashier, status, ...data } = req.body;
    const sale = await Sale.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('client vehicle services packages additionals cashier');
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar venta', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    await Process.deleteMany({ sale: sale._id });
    res.json({ message: 'Venta eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar venta', error: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    if (sale.status === 'cancelada') {
      return res.status(400).json({ message: 'La venta ya está cancelada' });
    }
    sale.status = 'cancelada';
    sale.cancelledAt = new Date();
    sale.cancelledBy = req.user._id;
    await sale.save();
    await Process.updateMany({ sale: sale._id }, { status: 'terminado', finishedAt: new Date() });
    res.json(await sale.populate('client vehicle cashier cancelledBy'));
  } catch (err) {
    res.status(500).json({ message: 'Error al cancelar venta', error: err.message });
  }
};

exports.rainGuarantee = async (req, res) => {
  try {
    const originalSale = await Sale.findById(req.params.id).populate('packages');
    if (!originalSale) return res.status(404).json({ message: 'Venta original no encontrada' });
    if (originalSale.status !== 'activa') {
      return res.status(400).json({ message: 'La venta original no está activa' });
    }

    const pkgsWithGuarantee = originalSale.packages.filter(p => p.rainGuaranteeHours > 0);
    if (pkgsWithGuarantee.length === 0) {
      return res.status(400).json({ message: 'La venta no tiene garantía de lluvia' });
    }

    const maxHours = Math.max(...pkgsWithGuarantee.map(p => p.rainGuaranteeHours));
    const expiresAt = new Date(originalSale.createdAt.getTime() + maxHours * 60 * 60 * 1000);
    if (new Date() > expiresAt) {
      return res.status(400).json({ message: 'La garantía de lluvia ha expirado' });
    }

    const folio = await generateFolio();
    const newSale = await Sale.create({
      folio,
      client: originalSale.client,
      vehicle: originalSale.vehicle,
      services: originalSale.services,
      packages: originalSale.packages.map(p => p._id),
      additionals: originalSale.additionals,
      total: 0,
      cashier: req.user._id,
      status: 'garantia',
      rainGuaranteeApplied: true,
      rainGuaranteeDate: new Date(),
      originalSale: originalSale._id
    });

    originalSale.rainGuaranteeApplied = true;
    originalSale.rainGuaranteeDate = new Date();
    await originalSale.save();

    await Process.create({ sale: newSale._id, vehicle: newSale.vehicle });
    res.status(201).json(await newSale.populate('client vehicle services packages cashier'));
  } catch (err) {
    res.status(500).json({ message: 'Error al aplicar garantía de lluvia', error: err.message });
  }
};
