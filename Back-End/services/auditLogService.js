const AuditLogModel = require('../models/auditLogModel');

class AuditLogService {
  static async log({ userId, action, entity, entityId, before, after }) {
    try {
      await AuditLogModel.create({ userId, action, entity, entityId, before, after });
    } catch (err) {
      // Не выбрасываем ошибку наружу, чтобы не ломать основной flow
      console.error('AuditLog error:', err.message);
    }
  }
}

module.exports = AuditLogService;

