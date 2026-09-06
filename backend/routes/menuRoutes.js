const express = require('express')
const MenuItem = require('../models/MenuItem')
const router = express.Router()

router.get('/', async (req, res) => {
  const items = await MenuItem.find().sort({ createdAt: -1 })
  res.json(items)
})

router.post('/', async (req, res) => {
  try {
    const { name, category, price } = req.body
    if (!name || !category || !price) return res.status(400).json({ message: 'Please fill all fields.' })
    const item = await MenuItem.create({ name, category, price })
    res.status(201).json(item)
  } catch (error) { res.status(500).json({ message: 'Could not add menu item.' }) }
})

router.delete('/:id', async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ message: 'Menu item not found.' })
  res.json({ message: 'Menu item deleted.' })
})

module.exports = router
