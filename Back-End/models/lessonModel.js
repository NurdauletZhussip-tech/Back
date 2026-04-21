const pool = require('../db');

class LessonModel {
  static async findAll() {
    const res = await pool.query('SELECT * FROM lessons ORDER BY order_index');
    return res.rows;
  }
  static async findById(id) {
    const res = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);
    return res.rows[0];
  }
}
module.exports = LessonModel;