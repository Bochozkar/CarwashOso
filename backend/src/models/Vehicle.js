const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plate: { type: String, required: true, unique: true, uppercase: true },
  brand: { type: String, required: true },
  model: { type: String },
  color: { type: String },
  year: { type: Number },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
