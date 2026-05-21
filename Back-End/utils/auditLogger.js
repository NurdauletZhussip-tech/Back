const AuditLogService = require('../services/auditLogService');

function logAdminAction({ userId, action, entity, entityId, before = null, after = null }) {
  return AuditLogService.log({ userId, action, entity, entityId, before, after });
}

module.exports = {
  logAdminAction
};
