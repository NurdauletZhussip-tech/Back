const express = require('express');
const router = express.Router();
const BadgeController = require('../controllers/badgeController');
const { authenticate, authorizeChildAccess } = require('../middleware/authMiddleware');
const { param } = require('express-validator');
const { runValidation } = require('../middleware/validation');

router.get('/', BadgeController.getAll);

router.get(
  '/users/:childId',
  authenticate,
  param('childId').notEmpty(),
  runValidation,
  authorizeChildAccess,
  BadgeController.getForChild
);

router.get(
  '/for-child/:childId',
  authenticate,
  param('childId').notEmpty(),
  runValidation,
  authorizeChildAccess,
  BadgeController.getAllWithStatus
);

module.exports = router;
