const BadgeModel = require('../models/badgeModel');
const prisma = require('../prismaClient');

class BadgeService {
  static async createBadge({ name, description, criteria_type, criteria_value, icon_url }) {
    return await prisma.badges.create({
      data: { name, description, criteria_type, criteria_value, icon_url }
    });
  }

  static async listBadges() {
    return await prisma.badges.findMany({ orderBy: { criteria_value: 'asc' } });
  }

  static async getBadgeById(id) {
    return await prisma.badges.findUnique({ where: { id } });
  }

  static async updateBadge(id, data) {
    return await prisma.badges.update({ where: { id }, data });
  }

  static async deleteBadge(id) {
    return await prisma.badges.delete({ where: { id } });
  }

  static async getBadgesForChild(childId) {
    return await prisma.user_badges.findMany({
      where: { child_id: childId },
      include: { badges: true }
    });
  }

  static async listWithEarned(childId) {
    // Return all badges with an `earned` boolean for the specified childId
    const [badges, awarded] = await Promise.all([
      prisma.badges.findMany({ orderBy: { criteria_value: 'asc' } }),
      prisma.user_badges.findMany({ where: { child_id: childId }, select: { badge_id: true } })
    ]);
    const awardedSet = new Set(awarded.map(a => a.badge_id));
    return badges.map(b => ({ ...b, earned: awardedSet.has(b.id) }));
  }
}

module.exports = BadgeService;



