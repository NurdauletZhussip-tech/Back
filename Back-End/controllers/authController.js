const AuthService = require('../services/authService');

exports.registerParent = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    const result = await AuthService.registerParent(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.loginParent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const result = await AuthService.loginParent(email, password);
    res.json(result);
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') return res.status(401).json({ error: 'Invalid credentials' });
    res.status(500).json({ error: err.message });
  }
};