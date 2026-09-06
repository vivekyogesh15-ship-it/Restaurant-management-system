const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  items: { type: [orderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  billed: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
