const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const ExerciseController = require('../controllers/exerciseController');

router.use(authenticate, requireRole('admin'));


router.post('/lessons', AdminController.createLesson);
router.get('/lessons', AdminController.getLessons);
router.put('/lessons/:id', AdminController.updateLesson);
router.delete('/lessons/:id', AdminController.deleteLesson);

router.post('/lessons/:lessonId/exercises', ExerciseController.create);
router.get('/lessons/:lessonId/exercises', ExerciseController.getByLesson);
router.put('/exercises/:id', ExerciseController.update);
router.delete('/exercises/:id', ExerciseController.delete);

module.exports = router;