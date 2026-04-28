const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

class AuthService {
  static generateToken(userId, role) {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    });
  }

  static async registerParent(email, password, name) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new Error('EMAIL_EXISTS');
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));
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

  static async loginChild(childId, pin) {
    const child = await UserModel.findById(childId);
    if (!child || child.role !== 'child' || !child.pin) {
      throw new Error('INVALID_CREDENTIALS');
    }
    const valid = await bcrypt.compare(pin, child.pin);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    const token = this.generateToken(child.id, 'child');
    const { pin: _, ...safeChild } = child;
    return { user: safeChild, token };
  }
}

module.exports = AuthService;