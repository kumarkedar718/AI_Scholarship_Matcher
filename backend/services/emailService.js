const nodemailer = require('nodemailer');

/**
 * Get active Nodemailer transporter or null if unconfigured
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : '';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465, false for port 587 or others
      auth: {
        user,
        pass
      }
    });
  }

  return null;
};

/**
 * Verify transporter SMTP connectivity
 */
const verifyTransporter = async () => {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      configured: false,
      success: false,
      message: 'SMTP credentials missing (SMTP_HOST, SMTP_USER, or SMTP_PASS not configured in backend/.env)'
    };
  }

  try {
    await transporter.verify();
    return {
      configured: true,
      success: true,
      message: 'SMTP server connection verified successfully'
    };
  } catch (err) {
    return {
      configured: true,
      success: false,
      message: `SMTP connection verification failed: ${err.message}`
    };
  }
};

/**
 * Send Verification Email
 */
const sendVerificationEmail = async (user, unhashedToken) => {
  try {
    const backendPublicUrl = process.env.BACKEND_PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:5000';
    const verificationLink = `${backendPublicUrl}/api/auth/verify-email?token=${unhashedToken}`;
    const senderEmail = process.env.EMAIL_FROM || '"AI Scholarship Matcher" <noreply@scholarshipmatcher.edu>';

    console.log('\n==================================================');
    console.log('[SMTP EMAIL SERVICE] Generating Email Verification Link');
    console.log(`Target Email: ${user.email}`);
    console.log(`Backend Public URL Base: ${backendPublicUrl}`);
    console.log(`Generated Link: ${backendPublicUrl}/api/auth/verify-email?token=***SANITIZED_TOKEN***`);
    console.log('==================================================\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - AI Scholarship Matcher</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 35px 30px; color: #334155; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 15px; }
          .button-wrapper { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; }
          .link-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #475569; margin-top: 15px; }
          .notice { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 15px; font-size: 13px; color: #92400e; margin: 25px 0; border-radius: 4px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 AI Scholarship Matcher</h1>
          </div>
          <div class="content">
            <div class="greeting">Hello ${user.name},</div>
            <p>Thank you for registering with <strong>AI Scholarship Matcher</strong>. Please verify your email address to complete your registration and activate your account.</p>
            
            <div class="button-wrapper">
              <a href="${verificationLink}" class="btn" target="_blank">Verify Email Address</a>
            </div>

            <p>Or copy and paste this verification URL into your browser:</p>
            <div class="link-box">${verificationLink}</div>

            <div class="notice">
              ⏳ <strong>Token Expiry Notice:</strong> This verification link will expire in <strong>30 minutes</strong>. If it expires, you can request a new verification email from the login page.
            </div>

            <p style="font-size: 13px; color: #64748b;">🔒 <strong>Security Notice:</strong> If you did not create an account on AI Scholarship Matcher, no action is required and you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} AI Scholarship Matcher System. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    if (!transporter) {
      if (process.env.DEV_EMAIL_FALLBACK === 'true') {
        console.log('\n==================================================');
        console.log('--- [DEV EMAIL SERVICE: Simulated Console Output] ---');
        console.log(`To: ${user.email}`);
        console.log(`Subject: Verify Your Email - AI Scholarship Matcher`);
        console.log(`Verification URL: ${verificationLink}`);
        console.log('==================================================\n');
        return { success: true, isSimulated: true, messageId: 'simulated-dev-id' };
      }
      console.warn('sendVerificationEmail: SMTP credentials not set and DEV_EMAIL_FALLBACK disabled.');
      return {
        success: false,
        error: 'SMTP credentials missing. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env'
      };
    }

    const info = await transporter.sendMail({
      from: senderEmail,
      to: user.email,
      subject: 'Verify Your Email - AI Scholarship Matcher',
      html: htmlContent
    });

    console.log(`[SMTP Email Sent] Message ID: ${info.messageId} to ${user.email}`);
    return { success: true, messageId: info.messageId, isSimulated: false };
  } catch (error) {
    console.error('sendVerificationEmail Error:', error.message);
    return { success: false, error: error.message || 'Email delivery failed' };
  }
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (user, unhashedToken) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${unhashedToken}`;
    const senderEmail = process.env.EMAIL_FROM || '"AI Scholarship Matcher" <noreply@scholarshipmatcher.edu>';

    console.log('\n==================================================');
    console.log('[SMTP EMAIL SERVICE] Generating Password Reset Link');
    console.log(`Target Email: ${user.email}`);
    console.log(`Frontend URL Base: ${frontendUrl}`);
    console.log(`Generated Reset Link: ${frontendUrl}/reset-password?token=***SANITIZED_TOKEN***`);
    console.log('==================================================\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - AI Scholarship Matcher</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 35px 30px; color: #334155; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 15px; }
          .button-wrapper { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; background-color: #dc2626; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; }
          .link-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #475569; margin-top: 15px; }
          .notice { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 15px; font-size: 13px; color: #991b1b; margin: 25px 0; border-radius: 4px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 AI Scholarship Matcher</h1>
          </div>
          <div class="content">
            <div class="greeting">Hello ${user.name},</div>
            <p>We received a request to reset your password for your <strong>AI Scholarship Matcher</strong> account.</p>
            
            <div class="button-wrapper">
              <a href="${resetLink}" class="btn" target="_blank">Reset Password</a>
            </div>

            <p>Or copy and paste this password reset URL into your browser:</p>
            <div class="link-box">${resetLink}</div>

            <div class="notice">
              ⏳ <strong>Token Expiry Notice:</strong> This password reset link will expire in <strong>30 minutes</strong>.
            </div>

            <p style="font-size: 13px; color: #64748b;">🔒 <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} AI Scholarship Matcher System. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    if (!transporter) {
      if (process.env.DEV_EMAIL_FALLBACK === 'true') {
        console.log('\n==================================================');
        console.log('--- [DEV EMAIL SERVICE: Simulated Reset Email Output] ---');
        console.log(`To: ${user.email}`);
        console.log(`Subject: Reset Password - AI Scholarship Matcher`);
        console.log(`Reset URL: ${resetLink}`);
        console.log('==================================================\n');
        return { success: true, isSimulated: true, messageId: 'simulated-dev-id' };
      }
      return { success: false, error: 'SMTP credentials missing' };
    }

    const info = await transporter.sendMail({
      from: senderEmail,
      to: user.email,
      subject: 'Reset Your Password - AI Scholarship Matcher',
      html: htmlContent
    });

    return { success: true, messageId: info.messageId, isSimulated: false };
  } catch (error) {
    console.error('sendPasswordResetEmail Error:', error.message);
    return { success: false, error: error.message || 'Email delivery failed' };
  }
};

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (user) => {
  try {
    const senderEmail = process.env.EMAIL_FROM || '"AI Scholarship Matcher" <noreply@scholarshipmatcher.edu>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to AI Scholarship Matcher</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
          .content { padding: 35px 30px; color: #334155; line-height: 1.6; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome to ScholarMatch!</h1>
          </div>
          <div class="content">
            <h3>Hello ${user.name},</h3>
            <p>Your email address has been successfully verified! You can now explore personalized scholarship recommendations and track your financial aid applications.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} AI Scholarship Matcher System. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();
    if (!transporter) {
      if (process.env.DEV_EMAIL_FALLBACK === 'true') {
        console.log(`[DEV EMAIL SERVICE] Simulated Welcome Email to ${user.email}`);
        return { success: true, isSimulated: true };
      }
      return { success: false, error: 'SMTP missing' };
    }

    const info = await transporter.sendMail({
      from: senderEmail,
      to: user.email,
      subject: 'Welcome to AI Scholarship Matcher!',
      html: htmlContent
    });

    return { success: true, messageId: info.messageId, isSimulated: false };
  } catch (error) {
    console.error('sendWelcomeEmail Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  getTransporter,
  verifyTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
