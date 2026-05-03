const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const RefreshTokenModel = require('../models/refreshTokenModel');
const crypto = require('crypto');

class AuthService {
  static generateToken(userId, role) {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    });
  }

  static async generateTokens(user) {
    const accessToken = this.generateToken(user.id, user.role);
    // Refresh token: random string, store in DB with expiry
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresInDays = parseInt(process.env.REFRESH_TOKEN_DAYS) || 30;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    await RefreshTokenModel.create({ userId: user.id, token: refreshToken, expiresAt });
    return { accessToken, refreshToken };
  }

  static async registerParent(email, password, name) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new Error('EMAIL_EXISTS');

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = await UserModel.createParent({ email, password_hash: hashedPassword, name });
            const tokens = await this.generateTokens(user);
            return { user, token: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  static async createChild({ parentId, name, pin }) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPin = await bcrypt.hash(pin, saltRounds);
    const child = await UserModel.createChild({ parentId, name, pinHash: hashedPin });
    return child;
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
      const tokens = await this.generateTokens(user);
      const { password_hash, ...safeUser } = user;
      return { user: safeUser, token: tokens.accessToken, refreshToken: tokens.refreshToken };
    }

  static async loginChild(childId, pin) {
    const child = await UserModel.findById(childId);
    const storedHash = child?.pin_hash || child?.pin;

    if (!child || child.role !== 'child' || !storedHash) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(pin, storedHash);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    const tokens = await this.generateTokens(child);
    const { pin_hash, pin: _, ...safeChild } = child;
    return { user: safeChild, token: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  static async refreshAccessToken(refreshToken) {
    const record = await RefreshTokenModel.findByToken(refreshToken);
    if (!record) throw new Error('INVALID_REFRESH');
    if (new Date(record.expires_at) < new Date()) {
      await RefreshTokenModel.revoke(refreshToken);
      throw new Error('REFRESH_EXPIRED');
    }
    const user = await UserModel.findById(record.user_id);
    if (!user) throw new Error('INVALID_REFRESH');
    const accessToken = this.generateToken(user.id, user.role);
    return { accessToken };
  }

  static async revokeRefreshToken(refreshToken) {
    return await RefreshTokenModel.revoke(refreshToken);
  }
}

module.exports = AuthService;