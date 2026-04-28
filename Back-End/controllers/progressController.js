const LessonModel = require('../models/lessonModel');
const ProgressModel = require('../models/progressModel');
const ExerciseModel = require('../models/exerciseModel');
const AttemptModel = require('../models/attemptModel');
const StreakModel = require('../models/streakModel');
const GamificationService = require('../services/gamificationService');

exports.getChildProgress = async (req, res) => {
  try {
    const { childId } = req.params;
    const lessons = await LessonModel.findAll();

    const result = await Promise.all(lessons.map(async (lesson) => {
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

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChildDashboard = async (req, res) => {
  try {
    const { childId } = req.params;
    const totalXp = await AttemptModel.sumXpByChild(childId);
    const streak = await StreakModel.findByChild(childId) || { current_streak: 0, longest_streak: 0 };
    const lessonsCompleted = await GamificationService.countCompletedLessons(childId);

    res.json({
      totalXp,
      currentStreak: streak.current_streak,
      longestStreak: streak.longest_streak,
      lessonsCompleted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};