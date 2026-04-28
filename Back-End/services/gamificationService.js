const StreakModel = require('../models/streakModel');
const BadgeModel = require('../models/badgeModel');
const UserBadgeModel = require('../models/userBadgeModel');
const NotificationModel = require('../models/notificationModel');
const AttemptModel = require('../models/attemptModel');
const ProgressModel = require('../models/progressModel');

class GamificationService {
  static async updateStreak(childId) {
    const today = new Date().toISOString().slice(0,10);
    let streak = await StreakModel.findByChild(childId);
    if (!streak) {
      streak = await StreakModel.createOrUpdate({ childId, currentStreak: 1, longestStreak: 1, lastDate: today });
      return streak;
    }
    const last = streak.last_activity_date;
    if (!last) {
      return await StreakModel.createOrUpdate({ childId, currentStreak: 1, longestStreak: 1, lastDate: today });
    }
    const diff = (new Date(today) - new Date(last)) / (1000*3600*24);
    let newCurrent = streak.current_streak;
    if (diff === 1) newCurrent++;
    else if (diff === 0) return streak;
    else newCurrent = 1;
    const newLongest = Math.max(newCurrent, streak.longest_streak);
    const updated = await StreakModel.createOrUpdate({ childId, currentStreak: newCurrent, longestStreak: newLongest, lastDate: today });
    if (newCurrent % 7 === 0) {
      await this.checkAndAwardBadge(childId, 'streak_days', newCurrent);
    }
    return updated;
  }

  static async checkAndAwardBadge(childId, criteriaType, value) {
    const badges = await BadgeModel.findByCriteria(criteriaType, value);
    for (const badge of badges) {
      const awarded = await UserBadgeModel.award(childId, badge.id);
      if (awarded) {
        await NotificationModel.create({ userId: childId, type: 'badge', message: `You earned "${badge.name}"!` });
      }
    }
  }

  static async refreshBadges(childId) {
    const totalXp = await AttemptModel.sumXpByChild(childId);
    await this.checkAndAwardBadge(childId, 'total_xp', totalXp);
    const progressRes = await ProgressModel.findByChildAndLesson(childId, null);
    const lessonsCompleted = await this.countCompletedLessons(childId);
    await this.checkAndAwardBadge(childId, 'lessons_completed', lessonsCompleted);
  }

  static async countCompletedLessons(childId) {
    const pool = require('../db');
    const res = await pool.query('SELECT COUNT(*) FROM progress WHERE child_id=$1 AND completed=true', [childId]);
    return parseInt(res.rows[0].count);
  }
}
module.exports = GamificationService;