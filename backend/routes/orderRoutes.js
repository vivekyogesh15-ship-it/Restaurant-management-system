const express = require('express')
const Order = require('../models/Order')
const MenuItem = require('../models/MenuItem')
const Table = require('../models/Table')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('tableId').sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) { res.status(500).json({ message: 'Could not load orders.' }) }
})

router.post('/', async (req, res) => {
  try {
    const { tableId, items } = req.body
    if (!tableId || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Select a table and at least one food item.' })

    const table = await Table.findById(tableId)
    if (!table || table.status !== 'Available') return res.status(400).json({ message: 'Please select an available table.' })

    const orderItems = []
    for (const selectedItem of items) {
      const menuItem = await MenuItem.findById(selectedItem.menuItemId)
      const quantity = Number(selectedItem.quantity)
      if (!menuItem || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'One or more selected items are invalid.' })
      orderItems.push({ menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity, subtotal: menuItem.price * quantity })
    }

    const totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0)
    const order = await Order.create({ orderNumber: `ORD-${Date.now()}`, tableId, items: orderItems, totalAmount })
    table.status = 'Occupied'
    await table.save()
    const savedOrder = await Order.findById(order._id).populate('tableId')
    res.status(201).json(savedOrder)
  } catch (error) { res.status(500).json({ message: 'Could not place order.' }) }
})

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!['Pending', 'Completed'].includes(status)) return res.status(400).json({ message: 'Invalid order status.' })
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('tableId')
    if (!order) return res.status(404).json({ message: 'Order not found.' })
    res.json(order)
  } catch (error) { res.status(500).json({ message: 'Could not update order status.' }) }
})

router.patch('/:id/bill', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found.' })
    if (order.status !== 'Completed') return res.status(400).json({ message: 'Complete the order before finishing its bill.' })
    order.billed = true
    await order.save()
    await Table.findByIdAndUpdate(order.tableId, { status: 'Available' })
    res.json({ message: 'Bill completed and table is now available.' })
  } catch (error) { res.status(500).json({ message: 'Could not finish the bill.' }) }
})

module.exports = router
