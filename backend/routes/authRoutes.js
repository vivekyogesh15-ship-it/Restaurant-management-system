const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Please fill all fields.' })
    if (password.length < 4) return res.status(400).json({ message: 'Password must have at least 4 characters.' })
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'This email is already registered.' })
    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({ name, email, password: hashedPassword })
    res.status(201).json({ message: 'Registration successful. Please login.' })
  } catch (error) { res.status(500).json({ message: 'Registration failed. Please try again.' }) }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Email or password is incorrect.' })
    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) return res.status(401).json({ message: 'Email or password is incorrect.' })
    res.json({ message: `Welcome, ${user.name}! Login successful.` })
  } catch (error) { res.status(500).json({ message: 'Login failed. Please try again.' }) }
})

module.exports = router
