const router = require('express').Router();
const { getLessons, submitExercise } = require('../controllers/lessonController');
const { getChildProgress, getChildDashboard } = require('../controllers/progressController');
const { authenticate, authorizeChildAccess } = require('../middleware/authMiddleware');

router.get('/', authenticate, getLessons);

router.get('/progress/:childId', authenticate, authorizeChildAccess, getChildProgress);
router.get('/dashboard/:childId', authenticate, authorizeChildAccess, getChildDashboard);

router.post('/child/:childId/exercise/:exerciseId', authenticate, authorizeChildAccess, submitExercise);

module.exports = router;