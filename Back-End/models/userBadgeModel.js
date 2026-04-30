const prisma = require('../prismaClient');

class UserBadgeModel {
  static async find(childId, badgeId) {
    return await prisma.user_badges.findUnique({
      where: { child_id_badge_id: { child_id: childId, badge_id: badgeId } }
    });
  }

  static async award(childId, badgeId) {
    const existing = await this.find(childId, badgeId);
    if (!existing) {
      await prisma.user_badges.create({
        data: { child_id: childId, badge_id: badgeId }
      });
      return true;
    }
    return false;
  }
}
module.exports = UserBadgeModel;