const pool = require('../db');

class UserModel {
  static async findByEmail(email) {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }
  static async findById(id) {
    const res = await pool.query('SELECT id, email, role, parent_id, name, avatar_url FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }
  static async createParent({ email, passwordHash, name }) {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ($1, $2, $3, $4) RETURNING id, email, role, name`,
      [email, passwordHash, 'parent', name]
    );
    return res.rows[0];
  }
  static async createChild({ parentId, name, pinHash }) {
    const res = await pool.query(
      `INSERT INTO users (parent_id, role, name, pin)
       VALUES ($1, $2, $3, $4) RETURNING id, name, role, parent_id`,
      [parentId, 'child', name, pinHash]
    );
    return res.rows[0];
  }
}
module.exports = UserModel;