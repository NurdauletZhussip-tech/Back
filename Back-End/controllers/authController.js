const AuthService = require('../services/authService');
const UserModel = require('../models/userModel');
// ...existing code...

exports.registerParent = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Body is missing' });

    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing fields: email, password, name' });
    }
    const result = await AuthService.registerParent(email, password, name);
    try {
      const refreshToken = result.refreshToken;
      const days = parseInt(process.env.REFRESH_TOKEN_DAYS) || 30;
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: days * 24 * 60 * 60 * 1000 });
    } catch (e) {
    }
    res.status(201).json({ user: result.user, token: result.token });
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
    try {
      const refreshToken = result.refreshToken;
      const days = parseInt(process.env.REFRESH_TOKEN_DAYS) || 30;
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: days * 24 * 60 * 60 * 1000 });
    } catch (e) {}
    res.json({ user: result.user, token: result.token });
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Invalid refresh token' });
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err) {
    if (err.message === 'REFRESH_EXPIRED' || err.message === 'INVALID_REFRESH') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
    await AuthService.revokeRefreshToken(refreshToken);
    // clear cookie
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.json({ message: 'Logged out' });
  } catch (err) {
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
    // Delegate hashing and creation to AuthService to keep controller thin
    const child = await AuthService.createChild({ parentId: req.userId, name, pin });
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