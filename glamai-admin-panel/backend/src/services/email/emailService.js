const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed:', error);
      } else {
        logger.info('Email transporter is ready');
      }
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `GlamAI Admin <${process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || this.generateHtmlTemplate(options.subject, options.message)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully:', {
        to: options.email,
        subject: options.subject,
        messageId: info.messageId
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  generateHtmlTemplate(subject, message) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #007bff;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 0 0 5px 5px;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GlamAI Admin Panel</h1>
          </div>
          <div class="content">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} GlamAI. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  }

  async sendWelcomeEmail(user) {
    const message = `
      Welcome to GlamAI Admin Panel, ${user.name}!

      Your account has been successfully created. You can now log in and start using our AI-powered image processing features.

      Your account details:
      - Email: ${user.email}
      - Role: ${user.role}

      To get started:
      1. Log in to your account
      2. Configure your API settings
      3. Start processing images with GlamAI

      If you have any questions, please don't hesitate to contact our support team.

      Best regards,
      The GlamAI Team
    `;

    return this.sendEmail({
      email: user.email,
      subject: 'Welcome to GlamAI Admin Panel',
      message
    });
  }

  async sendPasswordResetEmail(user, resetUrl) {
    const message = `
      Hi ${user.name},

      You requested a password reset for your GlamAI Admin Panel account.

      Please click the link below to reset your password:
      ${resetUrl}

      This link will expire in 30 minutes for security reasons.

      If you didn't request this password reset, please ignore this email and your password will remain unchanged.

      Best regards,
      The GlamAI Team
    `;

    return this.sendEmail({
      email: user.email,
      subject: 'Password Reset Request - GlamAI Admin Panel',
      message
    });
  }

  async sendOTPEmail(user, otp) {
    const message = `
      Hi ${user.name},

      Your one-time password (OTP) for GlamAI Admin Panel is:

      ${otp}

      This code will expire in 5 minutes.

      If you didn't request this code, please secure your account immediately.

      Best regards,
      The GlamAI Team
    `;

    return this.sendEmail({
      email: user.email,
      subject: 'Your OTP Code - GlamAI Admin Panel',
      message
    });
  }

  async sendAPIUsageAlert(user, usage) {
    const message = `
      Hi ${user.name},

      This is an alert regarding your API usage on GlamAI Admin Panel.

      Current Usage:
      - Total API Calls: ${usage.totalCalls}
      - Calls Today: ${usage.todayCalls}
      - Success Rate: ${usage.successRate}%

      ${usage.alert}

      Please review your usage and adjust if necessary.

      Best regards,
      The GlamAI Team
    `;

    return this.sendEmail({
      email: user.email,
      subject: 'API Usage Alert - GlamAI Admin Panel',
      message
    });
  }
}

// Export singleton instance
module.exports = {
  emailService: new EmailService(),
  sendEmail: (options) => new EmailService().sendEmail(options)
};