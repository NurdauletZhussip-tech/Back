
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

exports.authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

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
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.requireRole = (role) => (req, res, next) => {
  if (req.userRole !== role) {
    return res.status(403).json({ error: `Role '${role}' required` });
  }
  next();
};


exports.authorizeChildAccess = async (req, res, next) => {
  try {
    const { childId } = req.params;
    if (!childId) return next();

    if (req.userRole === 'child') {
      if (String(req.userId) !== String(childId)) {
        return res.status(403).json({ error: 'Access denied to this child' });
      }
      return next();
    }

    if (req.userRole === 'parent') {
      const child = await UserModel.findById(childId);
      if (!child || String(child.parent_id) !== String(req.userId)) {
        return res.status(403).json({ error: 'This child does not belong to you' });
      }
      return next();
    }

    res.status(403).json({ error: 'Access denied' });
  } catch (err) {
    res.status(500).json({ error: 'Authorization error' });
  }
};

module.exports = exports;