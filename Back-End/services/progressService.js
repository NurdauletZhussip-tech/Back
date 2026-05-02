const LessonService = require('./lessonService');
const ProgressModel = require('../models/progressModel');
const ExerciseModel = require('../models/exerciseModel');
const AttemptModel = require('../models/attemptModel');
const StreakModel = require('../models/streakModel');
const GamificationService = require('./gamificationService');

class ProgressService {
  static async getChildProgress(childId, query) {
    const paginatedLessons = await LessonService.getAllLessonsPaginated(query);

    const enrichedData = await Promise.all(paginatedLessons.data.map(async (lesson) => {
      const progress = await ProgressModel.findByChildAndLesson(childId, lesson.id) ||
                       { completed: false, score: 0 };

      const exercises = await ExerciseModel.findByLessonId(lesson.id);
      const attempts = await AttemptModel.getLastCorrectPerExercise(childId, lesson.id);
      const completedCount = attempts.filter(a => a.last_correct === true).length;

      return {
        ...lesson,
        progress,
        totalExercises: exercises.length,
        completedExercises: completedCount,
        completionRate: progress.score || 0
      };
    }));

    return {
      data: enrichedData,
      meta: paginatedLessons.meta
    };
  }

  static async getChildDashboard(childId) {
    const totalXp = await AttemptModel.sumXpByChild(childId);
    const streak = await StreakModel.findByChild(childId) || {
      current_streak: 0,
      longest_streak: 0
    };
    const lessonsCompleted = await GamificationService.countCompletedLessons(childId);

    return {
      totalXp,
      currentStreak: streak.current_streak,
      longestStreak: streak.longest_streak,
      lessonsCompleted
    };
  }
}

module.exports = ProgressService;

