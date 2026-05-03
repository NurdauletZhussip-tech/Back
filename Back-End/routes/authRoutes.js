// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const UserModel = require('../models/userModel');
const { runValidation } = require('../middleware/validation');

router.post('/register',
  body('email').isEmail().withMessage('invalid email'),
  body('password').isLength({ min: 6 }).withMessage('password too short'),
  body('name').notEmpty().withMessage('name required'),
  runValidation,
  AuthController.registerParent
);

router.post('/login',
  body('email').isEmail().withMessage('invalid email'),
  body('password').notEmpty().withMessage('password required'),
  runValidation,
  AuthController.loginParent
);


router.get('/children', authenticate, requireRole('parent'), async (req, res) => {
  try {
    const children = await UserModel.findChildrenByParent(req.userId);
    res.json(children || []);
  } catch (err) {
    console.error('Error fetching children:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/children', authenticate, requireRole('parent'),
  body('name').notEmpty().withMessage('name required'),
  body('pin').isLength({ min: 4 }).withMessage('pin too short'),
  runValidation,
  AuthController.createChild
);

router.post('/child/login', AuthController.loginChild);

// Refresh access token
router.post('/refresh', AuthController.refreshToken);

// Logout (revoke refresh token)
router.post('/logout', AuthController.logout);


module.exports = router;