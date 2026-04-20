const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  rainGuaranteeHours: { type: Number, enum: [0, 24, 48], default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
