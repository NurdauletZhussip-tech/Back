const BadgeService = require('../services/badgeService');

class BadgeController {
  static async getAll(req, res) {
    try {
      const badges = await BadgeService.listBadges();
      res.json(badges);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getForChild(req, res) {
    try {
      const { childId } = req.params;
      const awarded = await BadgeService.getBadgesForChild(childId);
      // Return just badge info and awarded metadata
      const result = awarded.map(a => ({ awarded_at: a.awarded_at, badge: a.badges }));
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAllWithStatus(req, res) {
    try {
      const { childId } = req.params;
      const list = await BadgeService.listWithEarned(childId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = BadgeController;


