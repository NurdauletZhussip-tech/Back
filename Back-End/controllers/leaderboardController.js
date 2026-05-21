const LeaderboardService = require('../services/leaderboardService');
const asyncHandler = require('../middleware/asyncHandler');

exports.getLeaderboard = asyncHandler(async (req, res) => {
  const result = await LeaderboardService.getByAgeGroup(req.query.ageGroup || 'all', req.query.limit);
  res.setHeader('Cache-Control', `public, max-age=${result.ttlSeconds}`);
  res.json(result);
});
