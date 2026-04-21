require('dotenv').config();
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  try {
    const existing = await UserModel.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.createParent({ email, passwordHash: hashed, name });
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await UserModel.findByEmail(email);
    if (!user || user.role !== 'parent') return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/children', authenticate, requireRole('parent'), async (req, res, next) => {
  try {
    const { name, pin } = req.body;
    if (!name || !pin) return res.status(400).json({ error: 'Name and PIN required' });
    const pinHash = await bcrypt.hash(pin, parseInt(process.env.BCRYPT_ROUNDS));
    const child = await UserModel.createChild({
      parentId: req.userId,
      name,
      pinHash
    });
    res.status(201).json(child);
  } catch (err) { next(err); }
});

module.exports = router;