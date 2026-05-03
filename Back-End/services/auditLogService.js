const AuditLogModel = require('../models/auditLogModel');

class AuditLogService {
  static async log({ userId, action, entity, entityId, before, after }) {
    try {
      await AuditLogModel.create({ userId, action, entity, entityId, before, after });
    } catch (err) {
      console.error('AuditLog error:', err.message);
    }
  }
}

module.exports = AuditLogService;

