const Sale = require('../models/Sale');

const generateFolio = async () => {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
  const lastSale = await Sale.findOne({ folio: new RegExp(`^OSO-${datePart}-`) })
    .sort({ createdAt: -1 });

  let sequence = 1;
  if (lastSale) {
    const parts = lastSale.folio.split('-');
    sequence = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `OSO-${datePart}-${String(sequence).padStart(4, '0')}`;
};

module.exports = generateFolio;
