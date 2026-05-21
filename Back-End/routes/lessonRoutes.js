const router = require('express').Router();
const { body, param } = require('express-validator');
const LessonController = require('../controllers/lessonController');
const ProgressController = require('../controllers/progressController');
const { authenticate, authorizeChildAccess } = require('../middleware/authMiddleware');
const { runValidation } = require('../middleware/validation');

router.use(authenticate);

router.get('/', LessonController.getLessons);
router.get('/all', LessonController.getAllPublished);

router.get(
  '/progress/:childId',
  param('childId').notEmpty(),
  runValidation,
  authorizeChildAccess,
  ProgressController.getChildProgress
);

router.get(
  '/dashboard/:childId',
  param('childId').notEmpty(),
  runValidation,
  authorizeChildAccess,
  ProgressController.getChildDashboard
);

router.get('/:lessonId/exercises', param('lessonId').notEmpty(), runValidation, LessonController.getExercisesByLesson);
router.get('/:lessonId', param('lessonId').notEmpty(), runValidation, LessonController.getLessonById);

router.post(
  '/child/:childId/exercise/:exerciseId',
  param('childId').notEmpty(),
  param('exerciseId').notEmpty(),
  body('answer').notEmpty().withMessage('Answer required'),
  runValidation,
  authorizeChildAccess,
  LessonController.submitExercise
);

module.exports = router;
