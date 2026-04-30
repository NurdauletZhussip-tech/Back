const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.use(authenticate, requireRole('admin'));

router.post('/lessons', AdminController.createLesson);
router.get('/lessons', AdminController.getLessons);
router.put('/lessons/:id', AdminController.updateLesson);
router.delete('/lessons/:id', AdminController.deleteLesson);

module.exports = router;