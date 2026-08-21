const db = require("../db");

function auditLog(action, entityName) {
  return async (req, res, next) => {
    const originalJson = res.json;
    res.json = function(data) {
      res.json = originalJson;
      if (res.statusCode >= 200 && res.statusCode < 300) {
        db.createAuditLog({
          userId: req.user ? req.user.id : null,
          action,
          entityName,
          entityId: req.params.id || (data && data.data && data.data.id) || null,
          ipAddress: req.ip || req.connection.remoteAddress,
          metadata: {
            method: req.method,
            path: req.originalUrl,
            params: req.params
          }
        }).catch(err => console.error("Audit log error:", err));
      }
      return originalJson.call(this, data);
    };
    next();
  };
}

module.exports = {
  auditLog
};
