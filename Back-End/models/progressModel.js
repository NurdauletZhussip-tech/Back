const pool = require('../db');

class ProgressModel {
  static async findByChildAndLesson(childId, lessonId) {
    const res = await pool.query('SELECT * FROM progress WHERE child_id = $1 AND lesson_id = $2', [childId, lessonId]);
    return res.rows[0];
  }
  static async createOrUpdate({ childId, lessonId, completed, score, completedAt }) {
    const existing = await this.findByChildAndLesson(childId, lessonId);
    if (existing) {
      const res = await pool.query(
        `UPDATE progress SET completed=$1, score=$2, completed_at=$3, updated_at=NOW()
         WHERE id=$4 RETURNING *`,
        [completed, score, completedAt, existing.id]
      );
      return res.rows[0];
    } else {
      const res = await pool.query(
        `INSERT INTO progress (child_id, lesson_id, completed, score, completed_at)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [childId, lessonId, completed, score, completedAt]
      );
      return res.rows[0];
    }
  }
}
module.exports = ProgressModel;