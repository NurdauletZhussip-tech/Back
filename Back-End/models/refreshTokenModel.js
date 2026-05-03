const prisma = require('../prismaClient');

class RefreshTokenModel {
  static async create({ userId, token, expiresAt }) {
    return await prisma.refresh_tokens.create({ data: { user_id: userId, token, expires_at: expiresAt } });
  }

  static async findByToken(token) {
    return await prisma.refresh_tokens.findUnique({ where: { token } });
  }

  static async revoke(token) {
    try {
      return await prisma.refresh_tokens.delete({ where: { token } });
    } catch (e) {
      return null;
    }
  }

  static async revokeAllForUser(userId) {
    return await prisma.refresh_tokens.deleteMany({ where: { user_id: userId } });
  }
}

module.exports = RefreshTokenModel;

