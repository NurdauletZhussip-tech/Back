const router = require('express').Router();
const { getLessons, submitExercise } = require('../controllers/lessonController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/', authenticate, getLessons);
router.post('/child/:childId/exercise/:exerciseId', authenticate, submitExercise);
module.exports = router;