// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
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

router.get('/verify-email', AuthController.verifyEmail);

router.get('/children', authenticate, requireRole('parent'), AuthController.listChildren);

router.post('/children', authenticate, requireRole('parent'),
  body('name').notEmpty().withMessage('name required'),
  body('pin').isLength({ min: 4 }).withMessage('pin too short'),
  runValidation,
  AuthController.createChild
);

router.post('/child/login',
  body('childId').notEmpty().withMessage('childId required'),
  body('pin').notEmpty().withMessage('pin required'),
  runValidation,
  AuthController.loginChild
);

router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);


module.exports = router;
