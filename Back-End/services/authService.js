const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

class AuthService {
  static generateToken(userId, role) {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  }
  static async registerParent(email, password, name) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new Error('EMAIL_EXISTS');
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
    const user = await UserModel.createParent({ email, passwordHash: hashedPassword, name });
    const token = this.generateToken(user.id, user.role);
    return { user, token };
  }
  static async loginParent(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user || user.role !== 'parent') throw new Error('INVALID_CREDENTIALS');
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('INVALID_CREDENTIALS');
    const token = this.generateToken(user.id, user.role);
    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token };
  }
}
module.exports = AuthService;