const router = require('express').Router();
const { getLessons, getExercisesByLesson, submitExercise,getLessonById } = require('../controllers/lessonController');
const { getChildProgress, getChildDashboard } = require('../controllers/progressController');
const { authenticate, authorizeChildAccess } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');

router.get('/', authenticate, getLessons);

router.get('/all', authenticate, async (req, res) => {
  try {
    const lessons = await prisma.lessons.findMany({
      where: { is_published: true },
      orderBy: { order_index: 'asc' },
      include: {
        units: true,
        exercises: {
          orderBy: { order_index: 'asc' }
        }
      }
    });
    res.json(lessons);
  } catch (err) {
    console.error('Ошибка /lessons/all:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:lessonId', authenticate, getLessonById);




router.get('/progress/:childId',  authenticate, authorizeChildAccess, getChildProgress);
router.get('/dashboard/:childId', authenticate, authorizeChildAccess, getChildDashboard);

router.get('/:lessonId/exercises', authenticate, getExercisesByLesson);

router.post('/child/:childId/exercise/:exerciseId', authenticate, authorizeChildAccess, submitExercise);

module.exports = router;