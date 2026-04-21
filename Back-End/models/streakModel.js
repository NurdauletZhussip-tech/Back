const pool = require('../db');

class StreakModel {
  static async findByChild(childId) {
    const res = await pool.query('SELECT * FROM streaks WHERE child_id = $1', [childId]);
    return res.rows[0];
  }
  static async createOrUpdate({ childId, currentStreak, longestStreak, lastDate }) {
    const existing = await this.findByChild(childId);
    if (existing) {
      const res = await pool.query(
        `UPDATE streaks SET current_streak=$1, longest_streak=$2, last_activity_date=$3, updated_at=NOW()
         WHERE child_id=$4 RETURNING *`,
        [currentStreak, longestStreak, lastDate, childId]
      );
      return res.rows[0];
    } else {
      const res = await pool.query(
        `INSERT INTO streaks (child_id, current_streak, longest_streak, last_activity_date)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [childId, currentStreak, longestStreak, lastDate]
      );
      return res.rows[0];
    }
  }
}
module.exports = StreakModel;