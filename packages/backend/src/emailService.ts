import nodemailer from 'nodemailer';
import { SmtpConfig, EmailConfig } from './alertTypes';

export class EmailService {
  private transporter!: nodemailer.Transporter;
  private mockMode: boolean;

  constructor(smtpConfig: SmtpConfig, mockMode = false) {
    this.mockMode = mockMode;
    if (!mockMode) {
      this.transporter = nodemailer.createTransport(smtpConfig);
    }
  }

  async sendAlert(emailConfig: EmailConfig, eventData: any): Promise<void> {
    try {
      // Replace placeholders in subject and body with event data
      const subject = this.replacePlaceholders(emailConfig.subject, eventData);
      const body = this.replacePlaceholders(emailConfig.body, eventData);

      if (this.mockMode) {
        console.log('📧 Mock alert email sent:', {
          from: emailConfig.from,
          to: emailConfig.to,
          subject,
          body,
        });
      } else {
        await this.transporter.sendMail({
          from: emailConfig.from,
          to: emailConfig.to.join(', '),
          subject,
          text: body,
        });
        console.log('📧 Alert email sent successfully');
      }
    } catch (error) {
      console.error('❌ Failed to send alert email:', error);
      throw error;
    }
  }

  private replacePlaceholders(template: string, data: any): string {
    return template.replace(/\${(\w+)}/g, (match, key) => {
      return data[key] || match;
    });
  }

  async verifyConnection(): Promise<boolean> {
    if (this.mockMode) {
      console.log('✅ Mock SMTP connection verified');
      return true;
    }
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return false;
    }
  }
}
