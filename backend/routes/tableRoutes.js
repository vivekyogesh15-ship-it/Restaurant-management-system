const express = require('express')
const Table = require('../models/Table')
const router = express.Router()

router.get('/', async (req, res) => {
  let tables = await Table.find().sort({ tableNumber: 1 })
  if (tables.length === 0) {
    await Table.insertMany([1, 2, 3, 4, 5].map((tableNumber) => ({ tableNumber })))
    tables = await Table.find().sort({ tableNumber: 1 })
  }
  res.json(tables)
})

router.patch('/:id', async (req, res) => {
  const { status } = req.body
  if (!['Available', 'Occupied'].includes(status)) return res.status(400).json({ message: 'Invalid table status.' })
  const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!table) return res.status(404).json({ message: 'Table not found.' })
  res.json(table)
})

module.exports = router
