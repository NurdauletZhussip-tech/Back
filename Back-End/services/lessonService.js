const ExerciseModel = require('../models/exerciseModel');
const ProgressModel = require('../models/progressModel');
const AttemptModel = require('../models/attemptModel');
const GamificationService = require('./gamificationService');
const pool = require('../db');

class LessonService {
  static async submitExercise(childId, exerciseId, answer) {
    const exercise = await ExerciseModel.findById(exerciseId);
    if (!exercise) throw new Error('EXERCISE_NOT_FOUND');
    const isCorrect = answer.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase();
    const xpEarned = isCorrect ? exercise.xp_value : 0;
    await AttemptModel.create({ childId, exerciseId, correct: isCorrect, xpEarned });

    const lessonId = exercise.lesson_id;
    let progress = await ProgressModel.findByChildAndLesson(childId, lessonId);
    if (!progress) {
      progress = await ProgressModel.createOrUpdate({ childId, lessonId, completed: false, score: 0, completedAt: null });
    }

    // пересчёт score на основе последних попыток
    const attemptsData = await AttemptModel.getLastCorrectPerExercise(childId, lessonId);
    const total = attemptsData.length;
    const correctCount = attemptsData.filter(a => a.last_correct === true).length;
    const newScore = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const completed = newScore >= 80;
    const completedAt = completed && !progress.completed ? new Date() : progress.completed_at;
    await ProgressModel.createOrUpdate({ childId, lessonId, completed, score: newScore, completedAt });

    // Обновляем геймификацию
    await GamificationService.updateStreak(childId);
    await GamificationService.refreshBadges(childId);

    return { correct: isCorrect, xpEarned, lessonCompleted: completed, newScore };
  }
}
module.exports = LessonService;