const AdminService = require('../services/adminService');
const AuditLogService = require('../services/auditLogService');
const LessonModel = require('../models/lessonModel');
const BadgeService = require('../services/badgeService');

class AdminController {
  static async getLessons(req, res) {
    try {
      const result = await AdminService.getLessonsPaginated(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createLesson(req, res) {
    try {
      const lesson = await AdminService.createLesson(req.body);
      await AuditLogService.log({
        userId: req.userId,
        action: 'CREATE_LESSON',
        entity: 'lesson',
        entityId: lesson.id,
        before: null,
        after: lesson
      });
      res.status(201).json(lesson);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateLesson(req, res) {
    try {
      const before = await LessonModel.findById(req.params.id);
      const updatedLesson = await AdminService.updateLesson(req.params.id, req.body);
      await AuditLogService.log({
        userId: req.userId,
        action: 'UPDATE_LESSON',
        entity: 'lesson',
        entityId: req.params.id,
        before,
        after: updatedLesson
      });
      res.json(updatedLesson);
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Урок не найден' });
      }
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteLesson(req, res) {
    try {
      const before = await LessonModel.findById(req.params.id);
      await AdminService.deleteLesson(req.params.id);
      await AuditLogService.log({
        userId: req.userId,
        action: 'DELETE_LESSON',
        entity: 'lesson',
        entityId: req.params.id,
        before,
        after: null
      });
      res.json({ message: 'Урок успешно удален' });
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Урок не найден' });
      }
      res.status(500).json({ error: err.message });
    }
  }

  static async createBadge(req, res) {
    try {
      const data = req.body;
      const badge = await BadgeService.createBadge(data);
      await AuditLogService.log({
        userId: req.userId,
        action: 'CREATE_BADGE',
        entity: 'badge',
        entityId: badge.id,
        before: null,
        after: badge
      });
      res.status(201).json(badge);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async listBadges(req, res) {
    try {
      const badges = await BadgeService.listBadges();
      res.json(badges);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getBadge(req, res) {
    try {
      const badge = await BadgeService.getBadgeById(req.params.id);
      if (!badge) return res.status(404).json({ error: 'Badge not found' });
      res.json(badge);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateBadge(req, res) {
    try {
      const before = await BadgeService.getBadgeById(req.params.id);
      if (!before) return res.status(404).json({ error: 'Badge not found' });
      const updated = await BadgeService.updateBadge(req.params.id, req.body);
      await AuditLogService.log({
        userId: req.userId,
        action: 'UPDATE_BADGE',
        entity: 'badge',
        entityId: req.params.id,
        before,
        after: updated
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteBadge(req, res) {
    try {
      const before = await BadgeService.getBadgeById(req.params.id);
      if (!before) return res.status(404).json({ error: 'Badge not found' });
      await BadgeService.deleteBadge(req.params.id);
      await AuditLogService.log({
        userId: req.userId,
        action: 'DELETE_BADGE',
        entity: 'badge',
        entityId: req.params.id,
        before,
        after: null
      });
      res.json({ message: 'Badge deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = AdminController;