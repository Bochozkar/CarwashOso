const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  folio: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
  additionals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['activa', 'cancelada', 'garantia'], default: 'activa' },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
  cancelledAt: { type: Date },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rainGuaranteeApplied: { type: Boolean, default: false },
  rainGuaranteeDate: { type: Date },
  originalSale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
