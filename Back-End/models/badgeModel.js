const pool = require('../db');

class BadgeModel {
  static async findByCriteria(criteriaType, value) {
    const res = await pool.query('SELECT * FROM badges WHERE criteria_type = $1 AND criteria_value <= $2', [criteriaType, value]);
    return res.rows;
  }
}
module.exports = BadgeModel;