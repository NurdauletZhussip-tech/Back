const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const RefreshTokenModel = require('../models/refreshTokenModel');
const crypto = require('crypto');
const EmailService = require('./emailService');

class AuthService {
  static generateToken(userId, role) {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    });
  }

  static async generateTokens(user) {
    const accessToken = this.generateToken(user.id, user.role);
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresInDays = parseInt(process.env.REFRESH_TOKEN_DAYS, 10) || 30;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    await RefreshTokenModel.create({ userId: user.id, token: refreshToken, expiresAt });
    return { accessToken, refreshToken };
  }

  static generateEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashEmailVerificationToken(token);
    const expiresInHours = parseInt(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS, 10) || 24;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    return { token, tokenHash, expiresAt };
  }

  static hashEmailVerificationToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async registerParent(email, password, name) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new Error('EMAIL_EXISTS');

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await UserModel.createParent({ email, password_hash: hashedPassword, name });
    const verification = this.generateEmailVerificationToken();
    await UserModel.setEmailVerificationToken({
      userId: user.id,
      tokenHash: verification.tokenHash,
      expiresAt: verification.expiresAt
    });
    const emailResult = await EmailService.sendEmailVerification({
      email: user.email,
      name: user.name,
      token: verification.token
    });
    return {
      user: { ...user, email_verified: false },
      emailPreviewUrl: emailResult.previewUrl
    };
  }

  static async createChild({ parentId, name, pin }) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashedPin = await bcrypt.hash(pin, saltRounds);
    const child = await UserModel.createChild({ parentId, name, pinHash: hashedPin });
    return child;
  }

  static async getChildrenForParent(parentId) {
    return await UserModel.findChildrenByParent(parentId);
  }

  static async loginParent(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user || (user.role !== 'parent' && user.role !== 'admin')) {
      throw new Error('INVALID_CREDENTIALS');
    }
    if (!user.password_hash) {
      throw new Error('INVALID_CREDENTIALS');
    }
    if (!user.email_verified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }
    const tokens = await this.generateTokens(user);
    const {
      email_verification_expires_at,
      email_verification_token_hash,
      password_hash,
      pin,
      ...safeUser
    } = user;
    return { user: safeUser, token: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  static async verifyEmail(token) {
    const tokenHash = this.hashEmailVerificationToken(token);
    const user = await UserModel.findByEmailVerificationTokenHash(tokenHash);

    if (!user) throw new Error('INVALID_EMAIL_VERIFICATION_TOKEN');
    if (new Date(user.email_verification_expires_at) < new Date()) {
      throw new Error('EMAIL_VERIFICATION_EXPIRED');
    }

    return await UserModel.markEmailVerified(user.id);
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
