const prisma = require('../prismaClient');
const CacheService = require('./cacheService');

const LEADERBOARD_TTL_SECONDS = parseInt(process.env.LEADERBOARD_CACHE_TTL_SECONDS, 10) || 300;
const LEADERBOARD_CACHE_VERSION = 'xp-v2';

function ageGroupToBirthDateRange(ageGroup) {
  const match = String(ageGroup || '').match(/^(\d+)-(\d+)$/);
  if (!match) return null;

  const minAge = parseInt(match[1], 10);
  const maxAge = parseInt(match[2], 10);
  const today = new Date();
  const youngestBirthDate = new Date(Date.UTC(today.getUTCFullYear() - minAge, today.getUTCMonth(), today.getUTCDate()));
  const oldestBirthDate = new Date(Date.UTC(today.getUTCFullYear() - maxAge - 1, today.getUTCMonth(), today.getUTCDate() + 1));

  return { gte: oldestBirthDate, lte: youngestBirthDate };
}

class LeaderboardService {
  static async getByAgeGroup(ageGroup = 'all', limit = 10) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const cacheKey = `leaderboard:${LEADERBOARD_CACHE_VERSION}:${ageGroup}:${safeLimit}`;
    const cached = await CacheService.getJson(cacheKey);
    if (cached) return { ...cached, cached: true };

    const birthRange = ageGroupToBirthDateRange(ageGroup);
    const childWhere = { role: 'child' };
    if (birthRange) childWhere.date_of_birth = birthRange;
    if (ageGroup === 'unknown') childWhere.date_of_birth = null;

    const children = await prisma.users.findMany({
      where: childWhere,
      select: { id: true, name: true, avatar_url: true, date_of_birth: true }
    });

    const childIds = children.map(child => child.id);
    const [attemptXpRows, completedLessons] = childIds.length === 0
      ? [[], []]
      : await Promise.all([
          prisma.exercise_attempts.groupBy({
            by: ['child_id'],
            where: { child_id: { in: childIds } },
            _sum: { xp_earned: true }
          }),
          prisma.progress.findMany({
            where: {
              child_id: { in: childIds },
              completed: true
            },
            select: {
              child_id: true,
              lessons: {
                select: { xp_reward: true }
              }
            }
          })
        ]);

    const xpByChild = new Map(attemptXpRows.map(row => [row.child_id, row._sum.xp_earned || 0]));
    for (const completedLesson of completedLessons) {
      const lessonXp = completedLesson.lessons?.xp_reward || 0;
      xpByChild.set(completedLesson.child_id, (xpByChild.get(completedLesson.child_id) || 0) + lessonXp);
    }

    const entries = children
      .map(child => ({
        childId: child.id,
        name: child.name,
        avatarUrl: child.avatar_url,
        dateOfBirth: child.date_of_birth,
        totalXp: xpByChild.get(child.id) || 0
      }))
      .sort((a, b) => b.totalXp - a.totalXp || a.name.localeCompare(b.name))
      .slice(0, safeLimit)
      .map((entry, index) => ({ rank: index + 1, ...entry }));

    const result = {
      ageGroup,
      ttlSeconds: LEADERBOARD_TTL_SECONDS,
      cached: false,
      entries
    };
    await CacheService.setJson(cacheKey, result, LEADERBOARD_TTL_SECONDS);
    return result;
  }

  static async invalidate() {
    await CacheService.invalidatePattern('leaderboard:');
  }
}

module.exports = LeaderboardService;
