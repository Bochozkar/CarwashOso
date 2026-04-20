const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  unit: { type: String },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  movements: [{
    type: { type: String, enum: ['entrada', 'salida'] },
    quantity: { type: Number },
    reason: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
