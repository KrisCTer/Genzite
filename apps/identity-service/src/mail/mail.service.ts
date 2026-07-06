import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`; 
    
    await this.mailerService.sendMail({
      to,
      subject: 'Khôi phục mật khẩu - Genzite',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h3 style="color: #333;">Xin chào,</h3>
          <p>Bạn đã gửi yêu cầu khôi phục mật khẩu cho tài khoản Genzite. Vui lòng bấm vào nút bên dưới để đặt lại mật khẩu mới:</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" style="padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ĐẶT LẠI MẬT KHẨU
            </a>
          </p>
          <p style="color: #ef4444; font-size: 0.9em;"><i>⚠️ Lưu ý: Link này chỉ có hiệu lực trong vòng 15 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</i></p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #666; font-size: 0.8em;">Genzite Support Team</p>
        </div>
      `,
    });
  }
}
