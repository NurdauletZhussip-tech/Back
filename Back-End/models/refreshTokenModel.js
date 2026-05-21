const prisma = require('../prismaClient');

class RefreshTokenModel {
  static async create({ userId, token, expiresAt }) {
    return await prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        token: token,
        expires_at: expiresAt
      }
    });
  }

  static async findByToken(token) {
    return await prisma.refresh_tokens.findUnique({
      where: { token: token }
    });
  }

  static async revoke(token) {
    try {
      return await prisma.refresh_tokens.delete({
        where: { token: token }
      });
    } catch (err) {
      if (err.code === 'P2025') return null;
      throw err;
    }
  }
}

module.exports = RefreshTokenModel;
