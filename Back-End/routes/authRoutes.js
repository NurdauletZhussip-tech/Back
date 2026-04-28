// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const UserModel = require('../models/userModel');

// ====================== PARENT AUTH ======================
router.post('/register', AuthController.registerParent);
router.post('/login', AuthController.loginParent);

// ====================== CHILDREN FOR PARENT ======================
router.get('/children', authenticate, requireRole('parent'), async (req, res) => {
  try {
    const children = await UserModel.findChildrenByParent(req.userId);
    res.json(children || []);
  } catch (err) {
    console.error('Error fetching children:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/children', authenticate, requireRole('parent'), AuthController.createChild);

// ====================== CHILD LOGIN ======================
router.post('/child/login', AuthController.loginChild);

module.exports = router;