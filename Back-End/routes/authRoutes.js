const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const AuthController = require('../controllers/authController');

router.post('/register', AuthController.registerParent);
router.post('/login', AuthController.loginParent);
router.post('/children', authenticate, requireRole('parent'), AuthController.createChild);


router.post('/child/login', async (req, res) => {
  const { childId, pin } = req.body;
  if (!childId || !pin) {
    return res.status(400).json({ error: 'Child ID and PIN required' });
  }

  try {
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const UserModel = require('../models/userModel');

    const child = await UserModel.findById(childId);
    if (!child || child.role !== 'child') {
      return res.status(404).json({ error: 'Child not found' });
    }

    const valid = await bcrypt.compare(pin, child.pin);
    if (!valid) return res.status(401).json({ error: 'Invalid PIN' });

    const token = jwt.sign(
      { userId: child.id, role: 'child' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { pin: _, ...safeChild } = child;
    res.json({ 
      success: true,
      user: safeChild, 
      token,
      message: 'Child logged in successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});