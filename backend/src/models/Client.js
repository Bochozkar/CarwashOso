const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
