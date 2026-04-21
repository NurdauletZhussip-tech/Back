const pool = require('../db');

class AttemptModel {
  static async create({ childId, exerciseId, correct, xpEarned }) {
    const res = await pool.query(
      `INSERT INTO exercise_attempts (child_id, exercise_id, correct, xp_earned)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [childId, exerciseId, correct, xpEarned]
    );
    return res.rows[0];
  }
  static async sumXpByChild(childId) {
    const res = await pool.query('SELECT COALESCE(SUM(xp_earned),0) as total FROM exercise_attempts WHERE child_id = $1', [childId]);
    return parseInt(res.rows[0].total);
  }
  static async getLastCorrectPerExercise(childId, lessonId) {
    const res = await pool.query(
      `SELECT e.id,
        (SELECT correct FROM exercise_attempts WHERE child_id=$1 AND exercise_id=e.id ORDER BY attempted_at DESC LIMIT 1) as last_correct
       FROM exercises e WHERE e.lesson_id=$2`,
      [childId, lessonId]
    );
    return res.rows;
  }
}
module.exports = AttemptModel;