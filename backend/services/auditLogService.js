const AuditLog = require('../models/AuditLog');

const logAdminAction = async ({ adminId, adminEmail, action, req, metadata }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.ip || '') : '';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';

    // Sanitization: Ensure NO sensitive credentials, tokens, or hashes are logged
    const cleanMeta = metadata ? { ...metadata } : {};
    delete cleanMeta.password;
    delete cleanMeta.token;
    delete cleanMeta.bootstrapSecret;
    delete cleanMeta.passwordHash;
    delete cleanMeta.verificationToken;

    await AuditLog.create({
      adminId: adminId || null,
      adminEmail: adminEmail || '',
      action,
      ipAddress: String(ipAddress),
      userAgent: String(userAgent),
      metadata: cleanMeta
    });
  } catch (err) {
    console.error('Audit Logging Exception:', err.message);
  }
};

module.exports = { logAdminAction };
