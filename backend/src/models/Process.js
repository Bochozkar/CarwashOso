const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
  sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['espera', 'proceso', 'terminado'], default: 'espera' },
  assignedAt: { type: Date },
  finishedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Process', processSchema);
