const router = require('express').Router();
const { getLessons, getExercisesByLesson, submitExercise,getLessonById } = require('../controllers/lessonController');
const { getChildProgress, getChildDashboard } = require('../controllers/progressController');
const { authenticate, authorizeChildAccess } = require('../middleware/authMiddleware');

router.get('/', authenticate, getLessons);

router.get('/:lessonId', authenticate, getLessonById);

router.get('/progress/:childId',  authenticate, authorizeChildAccess, getChildProgress);
router.get('/dashboard/:childId', authenticate, authorizeChildAccess, getChildDashboard);

router.get('/:lessonId/exercises', authenticate, getExercisesByLesson);

router.post('/child/:childId/exercise/:exerciseId', authenticate, authorizeChildAccess, submitExercise);

module.exports = router;