const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importing the Schema from Phase 1
const router = express.Router();

// POST: Register a new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    user = new User({ firstName, lastName, email, password: hashedPassword, phone, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST: Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Invalid credentials' });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Payload payload
      process.env.JWT_SECRET,                // Secret key from .env
      { expiresIn: '1d' }                    // Token expires in 1 day
    );

    res.json({ token, user: { id: user._id, name: user.firstName, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;