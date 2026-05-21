const nodemailer = require('nodemailer');

let transporterPromise;

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    })
  ]);
}

class EmailService {
  static getBaseUrl() {
    if (process.env.EMAIL_VERIFY_URL) {
      return process.env.EMAIL_VERIFY_URL;
    }

    return `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email`;
  }

  static buildVerificationUrl(token) {
    return `${this.getBaseUrl()}?token=${encodeURIComponent(token)}`;
  }

  static buildPasswordResetUrl(token) {
    return `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${encodeURIComponent(token)}`;
  }

  static async getTransporter() {
    if (!transporterPromise) {
      const timeoutMs = parseInt(process.env.EMAIL_SEND_TIMEOUT_MS, 10) || 5000;
      transporterPromise = withTimeout(
        nodemailer.createTestAccount(),
        timeoutMs,
        'Timed out creating Ethereal test account'
      ).then((account) => {
        return nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          connectionTimeout: timeoutMs,
          greetingTimeout: timeoutMs,
          socketTimeout: timeoutMs,
          auth: {
            user: account.user,
            pass: account.pass
          }
        });
      });
    }

    return transporterPromise;
  }

  static async sendEmailVerification({ email, name, token }) {
    const transporter = await this.getTransporter();
    const verifyUrl = this.buildVerificationUrl(token);
    const timeoutMs = parseInt(process.env.EMAIL_SEND_TIMEOUT_MS, 10) || 5000;

    const info = await withTimeout(
      transporter.sendMail({
        from: '"LiteracyBee" <no-reply@literacybee.local>',
        to: email,
        subject: 'Verify your LiteracyBee email',
        text: `Hi ${name}, verify your email: ${verifyUrl}`,
        html: `<p>Hi ${name},</p><p>Verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
      }),
      timeoutMs,
      'Timed out sending Ethereal email'
    );

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Ethereal email preview: ${previewUrl}`);
    }

    return { messageId: info.messageId, previewUrl };
  }

  static async sendPasswordReset({ email, name, token }) {
    const transporter = await this.getTransporter();
    const resetUrl = this.buildPasswordResetUrl(token);
    const timeoutMs = parseInt(process.env.EMAIL_SEND_TIMEOUT_MS, 10) || 5000;

    const info = await withTimeout(
      transporter.sendMail({
        from: '"LiteracyBee" <no-reply@literacybee.local>',
        to: email,
        subject: 'Reset your LiteracyBee password',
        text: `Hi ${name}, reset your password: ${resetUrl}`,
        html: `<p>Hi ${name},</p><p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
      }),
      timeoutMs,
      'Timed out sending Ethereal password reset email'
    );

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Ethereal password reset preview: ${previewUrl}`);
    }

    return { messageId: info.messageId, previewUrl };
  }
}

module.exports = EmailService;
