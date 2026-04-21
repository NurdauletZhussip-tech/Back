const pool = require('../db');

class UserBadgeModel {
  static async find(childId, badgeId) {
    const res = await pool.query('SELECT * FROM user_badges WHERE child_id = $1 AND badge_id = $2', [childId, badgeId]);
    return res.rows[0];
  }
  static async award(childId, badgeId) {
    const existing = await this.find(childId, badgeId);
    if (!existing) {
      await pool.query('INSERT INTO user_badges (child_id, badge_id) VALUES ($1,$2)', [childId, badgeId]);
      return true;
    }
    return false;
  }
}
module.exports = UserBadgeModel;