const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Process = require('../models/Process');

const buildDateRange = (start, end) => {
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  return { $gte: s, $lte: e };
};

const getSummary = async (dateRange) => {
  const [sales, expenses, processes] = await Promise.all([
    Sale.find({ createdAt: dateRange }).populate('services packages cashier client vehicle'),
    Expense.find({ date: dateRange }).populate('registeredBy'),
    Process.find({ createdAt: dateRange }).populate('sale vehicle assignedEmployees')
  ]);

  const activeSales = sales.filter(s => s.status === 'activa');
  const cancelledSales = sales.filter(s => s.status === 'cancelada');
  const guaranteeSales = sales.filter(s => s.status === 'garantia');
  const totalRevenue = activeSales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    sales: { total: sales.length, active: activeSales.length, cancelled: cancelledSales.length, guarantee: guaranteeSales.length, data: sales },
    revenue: { total: totalRevenue, net: totalRevenue - totalExpenses },
    expenses: { total: totalExpenses, data: expenses },
    processes: { total: processes.length, data: processes }
  };
};

exports.daily = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const dateRange = buildDateRange(date, date);
    const summary = await getSummary(dateRange);
    res.json({ date, ...summary });
  } catch (err) {
    res.status(500).json({ message: 'Error al generar reporte diario', error: err.message });
  }
};

exports.range = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate y endDate son requeridos' });
    }
    const dateRange = buildDateRange(startDate, endDate);
    const summary = await getSummary(dateRange);
    res.json({ startDate, endDate, ...summary });
  } catch (err) {
    res.status(500).json({ message: 'Error al generar reporte por rango', error: err.message });
  }
};
