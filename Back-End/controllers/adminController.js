const AdminService = require('../services/adminService');
const LessonModel = require('../models/lessonModel');
const BadgeService = require('../services/badgeService');
const asyncHandler = require('../middleware/asyncHandler');
const ERROR_CODES = require('../constants/errorCodes');
const { logAdminAction } = require('../utils/auditLogger');

class AdminController {
  static getLessons = asyncHandler(async (req, res) => {
    const result = await AdminService.getLessonsPaginated(req.query);
    res.json(result);
  });

  static createLesson = asyncHandler(async (req, res) => {
    const lesson = await AdminService.createLesson(req.body);

    await logAdminAction({
      userId: req.userId,
      action: 'CREATE_LESSON',
      entity: 'lesson',
      entityId: lesson.id,
      after: lesson
    });

    res.status(201).json(lesson);
  });

  static updateLesson = asyncHandler(async (req, res) => {
    const before = await LessonModel.findById(req.params.id);
    const updatedLesson = await AdminService.updateLesson(req.params.id, req.body);

    await logAdminAction({
      userId: req.userId,
      action: 'UPDATE_LESSON',
      entity: 'lesson',
      entityId: req.params.id,
      before,
      after: updatedLesson
    });

    res.json(updatedLesson);
  });

  static deleteLesson = asyncHandler(async (req, res) => {
    const before = await LessonModel.findById(req.params.id);
    await AdminService.deleteLesson(req.params.id);

    await logAdminAction({
      userId: req.userId,
      action: 'DELETE_LESSON',
      entity: 'lesson',
      entityId: req.params.id,
      before
    });

    res.json({ message: 'Lesson deleted' });
  });

  static createBadge = asyncHandler(async (req, res) => {
    const badge = await BadgeService.createBadge(req.body);

    await logAdminAction({
      userId: req.userId,
      action: 'CREATE_BADGE',
      entity: 'badge',
      entityId: badge.id,
      after: badge
    });

    res.status(201).json(badge);
  });

  static listBadges = asyncHandler(async (req, res) => {
    const badges = await BadgeService.listBadges();
    res.json(badges);
  });

  static getBadge = asyncHandler(async (req, res) => {
    const badge = await BadgeService.getBadgeById(req.params.id);
    if (!badge) throw new Error(ERROR_CODES.NOT_FOUND);

    res.json(badge);
  });

  static updateBadge = asyncHandler(async (req, res) => {
    const before = await BadgeService.getBadgeById(req.params.id);
    if (!before) throw new Error(ERROR_CODES.NOT_FOUND);

    const updated = await BadgeService.updateBadge(req.params.id, req.body);

    await logAdminAction({
      userId: req.userId,
      action: 'UPDATE_BADGE',
      entity: 'badge',
      entityId: req.params.id,
      before,
      after: updated
    });

    res.json(updated);
  });

  static deleteBadge = asyncHandler(async (req, res) => {
    const before = await BadgeService.getBadgeById(req.params.id);
    if (!before) throw new Error(ERROR_CODES.NOT_FOUND);

    await BadgeService.deleteBadge(req.params.id);

    await logAdminAction({
      userId: req.userId,
      action: 'DELETE_BADGE',
      entity: 'badge',
      entityId: req.params.id,
      before
    });

    res.json({ message: 'Badge deleted' });
  });
}

module.exports = AdminController;
