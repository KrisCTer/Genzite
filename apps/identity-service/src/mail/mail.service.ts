import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`; 
    
    await this.mailerService.sendMail({
      to,
      subject: 'Password Reset - Genzite',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h3 style="color: #333;">Hello,</h3>
          <p>You have requested to reset your password for your Genzite account. Please click the button below to set a new password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" style="padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              RESET PASSWORD
            </a>
          </p>
          <p style="color: #ef4444; font-size: 0.9em;"><i>⚠️ Note: This link is valid for 15 minutes only. If you did not request this, please ignore this email.</i></p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #666; font-size: 0.8em;">Genzite Support Team</p>
        </div>
      `,
    });
  }
}
