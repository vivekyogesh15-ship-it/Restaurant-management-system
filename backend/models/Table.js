const mongoose = require('mongoose')

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['Available', 'Occupied'], default: 'Available' },
})

module.exports = mongoose.model('Table', tableSchema)
