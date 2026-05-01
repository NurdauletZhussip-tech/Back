
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

    const userIdFromToken = String(req.userId || '');
    const childIdFromUrl = String(childId);

    console.log(`[authorizeChildAccess] Role: ${req.userRole}, TokenUserId: ${userIdFromToken}, ParamChildId: ${childIdFromUrl}`);

    // === CHILD ===
    if (req.userRole === 'child') {
      if (userIdFromToken === childIdFromUrl) {
        return next();
      }
      console.log(`[authorizeChildAccess] Child access DENIED`);
      return res.status(403).json({ error: 'Access denied to this child' });
    }

    // === PARENT ===
    if (req.userRole === 'parent') {
      const child = await UserModel.findById(childId);
      if (!child || String(child.parent_id) !== userIdFromToken) {
        return res.status(403).json({ error: 'This child does not belong to you' });
      }
      return next();
    }

    // === ADMIN (для удобства разработки) ===
    if (req.userRole === 'admin') {
      return next();
    }

    return res.status(403).json({ error: 'Access denied' });
  } catch (err) {
    console.error('Authorization error in authorizeChildAccess:', err);
    res.status(500).json({ error: 'Authorization error' });
  }
};