const AuthService = require('../services/authService');
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.registerParent = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Body is missing' });

    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing fields: email, password, name' });
    }
    const result = await AuthService.registerParent(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.loginParent = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Body is missing' });

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const result = await AuthService.loginParent(email, password);
    res.json(result);
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.createChild = async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Body is missing' });

    const { name, pin } = req.body;
    if (!name || !pin) {
      return res.status(400).json({ error: 'Name and PIN are required' });
    }
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const pinHash = await bcrypt.hash(pin, saltRounds);

    const child = await UserModel.createChild({
      parentId: req.userId,
      name,
      pinHash
    });
    res.status(201).json(child);
  } catch (err) {
    next(err);
  }
};

exports.loginChild = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Body is missing' });

    const { childId, pin } = req.body;
    if (!childId || !pin) return res.status(400).json({ error: 'Child ID and PIN required' });

    const result = await AuthService.loginChild(childId, pin);
    res.json(result);
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid PIN' });
    }
    res.status(500).json({ error: err.message });
  }
};