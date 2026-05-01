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

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await UserModel.createParent({ email, password_hash: hashedPassword, name });
    const token = this.generateToken(user.id, user.role);
    return { user, token };
  }

  static async loginParent(email, password) {
      const user = await UserModel.findByEmail(email);
  if (!user || (user.role !== 'parent' && user.role !== 'admin')) {
        throw new Error('INVALID_CREDENTIALS');
      }
      if (!user.password_hash) {
        throw new Error('INVALID_CREDENTIALS');
      }
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        throw new Error('INVALID_CREDENTIALS');
      }
      const token = this.generateToken(user.id, user.role);
      const { password_hash, ...safeUser } = user;
      return { user: safeUser, token };
    }

  static async loginChild(childId, pin) {
    const child = await UserModel.findById(childId);
    const storedHash = child?.pin_hash || child?.pin;

    if (!child || child.role !== 'child' || !storedHash) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(pin, storedHash);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    const token = this.generateToken(child.id, 'child');
    const { pin_hash, pin: _, ...safeChild } = child;
    return { user: safeChild, token };
  }
}

module.exports = AuthService;