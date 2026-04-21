const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

exports.authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user) throw new Error();
    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.requireRole = (role) => (req, res, next) => {
  if (req.userRole !== role) return res.status(403).json({ error: `Role ${role} required` });
  next();
};