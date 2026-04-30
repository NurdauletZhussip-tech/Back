const prisma = require('../prismaClient');

class StreakModel {
  static async findByChild(childId) {
    return await prisma.streaks.findUnique({ where: { child_id: childId } });
  }

  static async createOrUpdate({ childId, currentStreak, longestStreak, lastDate }) {
    const dateObj = new Date(lastDate);
    return await prisma.streaks.upsert({
      where: { child_id: childId },
      update: { current_streak: currentStreak, longest_streak: longestStreak, last_activity_date: dateObj, updated_at: new Date() },
      create: { child_id: childId, current_streak: currentStreak, longest_streak: longestStreak, last_activity_date: dateObj }
    });
  }
}
module.exports = StreakModel;