const router = require('express').Router();
const LeaderboardController = require('../controllers/leaderboardController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', LeaderboardController.getLeaderboard);

module.exports = router;
