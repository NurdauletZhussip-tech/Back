const prisma = require('../prismaClient');

class AuditLogModel {
  static async create({ userId, action, entity, entityId, before, after }) {
    return await prisma.audit_log.create({
      data: {
        user_id: userId,
        action,
        entity,
        entity_id: entityId,
        before,
        after
      }
    });
  }
}

module.exports = AuditLogModel;

