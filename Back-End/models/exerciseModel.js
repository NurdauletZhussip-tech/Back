const pool = require('../db');

class ExerciseModel {
  static async findByLessonId(lessonId) {
    const res = await pool.query('SELECT * FROM exercises WHERE lesson_id = $1 ORDER BY order_index', [lessonId]);
    return res.rows;
  }
  static async findById(id) {
    const res = await pool.query('SELECT * FROM exercises WHERE id = $1', [id]);
    return res.rows[0];
  }
}
module.exports = ExerciseModel;