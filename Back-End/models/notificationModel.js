const pool = require('../db');

class NotificationModel {
  static async create({ userId, type, message }) {
    const res = await pool.query(
      `INSERT INTO notifications (user_id, type, message) VALUES ($1,$2,$3) RETURNING *`,
      [userId, type, message]
    );
    return res.rows[0];
  }
}
module.exports = NotificationModel;