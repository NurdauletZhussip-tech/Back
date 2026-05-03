const AdminService = require('../services/adminService');
const AuditLogService = require('../services/auditLogService');
const LessonModel = require('../models/lessonModel');

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
}

module.exports = AdminController;