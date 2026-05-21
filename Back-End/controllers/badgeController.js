const BadgeService = require('../services/badgeService');
const asyncHandler = require('../middleware/asyncHandler');

class BadgeController {
  static getAll = asyncHandler(async (req, res) => {
    const badges = await BadgeService.listBadges();
    res.json(badges);
  });

  static getForChild = asyncHandler(async (req, res) => {
    const { childId } = req.params;
    const awarded = await BadgeService.getBadgesForChild(childId);
    const result = awarded.map((award) => ({
      awarded_at: award.awarded_at,
      badge: award.badges
    }));

    res.json(result);
  });

  static getAllWithStatus = asyncHandler(async (req, res) => {
    const { childId } = req.params;
    const list = await BadgeService.listWithEarned(childId);
    res.json(list);
  });
}

module.exports = BadgeController;
