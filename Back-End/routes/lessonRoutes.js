const router = require('express').Router();
const LessonController = {
  getLessons: require('../controllers/lessonController').getLessons,
  getExercisesByLesson: require('../controllers/lessonController').getExercisesByLesson,
  submitExercise: require('../controllers/lessonController').submitExercise,
  getLessonById: require('../controllers/lessonController').getLessonById
};
const ProgressController = {
  getChildProgress: require('../controllers/progressController').getChildProgress,
  getChildDashboard: require('../controllers/progressController').getChildDashboard
};
const { authenticate, authorizeChildAccess } = require('../middleware/authMiddleware');
const LessonService = require('../services/lessonService');

router.get('/', authenticate, LessonController.getLessons);

router.get('/all', authenticate, async (req, res) => {
  try {
    const lessons = await LessonService.getAllPublished();
    res.json(lessons);
  } catch (err) {
    console.error('Ошибка /lessons/all:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:lessonId', authenticate, LessonController.getLessonById);

router.get('/progress/:childId', authenticate, authorizeChildAccess, ProgressController.getChildProgress);
router.get('/dashboard/:childId', authenticate, authorizeChildAccess, ProgressController.getChildDashboard);

router.get('/:lessonId/exercises', authenticate, LessonController.getExercisesByLesson);

router.post('/child/:childId/exercise/:exerciseId', authenticate, authorizeChildAccess, LessonController.submitExercise);

module.exports = router;