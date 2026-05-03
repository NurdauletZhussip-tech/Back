const express = require('express');
const router = express.Router();
const BadgeController = require('../controllers/badgeController');
const { authenticate, authorizeChildAccess } = require('../middleware/authMiddleware');

// Public: list all available badges
router.get('/', BadgeController.getAll);

// Get badges awarded to a specific child (requires auth + child/parent/admin checks)
router.get('/users/:childId', authenticate, authorizeChildAccess, BadgeController.getForChild);

// Efficient endpoint: all badges with `earned` flag for given child
router.get('/for-child/:childId', authenticate, authorizeChildAccess, BadgeController.getAllWithStatus);

module.exports = router;


