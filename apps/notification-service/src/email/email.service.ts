import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;

  async onModuleInit() {
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USERNAME;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || (process.env.EMAIL_USERNAME ? 'smtp.gmail.com' : null);

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || (smtpHost === 'smtp.gmail.com' ? "465" : "587"), 10),
        secure: process.env.SMTP_SECURE === "true" || smtpHost === 'smtp.gmail.com',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log(`Initialized Nodemailer with real SMTP credentials (${smtpHost}).`);
    } else {
      this.logger.warn("No SMTP credentials found in env. Creating Ethereal test account...");
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      this.logger.log(`Ethereal Test Account created. User: ${testAccount.user}`);
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      const senderEmail = process.env.SMTP_USER || process.env.EMAIL_USERNAME || 'noreply@genzite.local';
      const info = await this.transporter.sendMail({
        from: `"Genzite App" <${senderEmail}>`,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent to ${to} | Subject: ${subject}`);
      
      // If using Ethereal, log the URL to view the email
      if (info.messageId && nodemailer.getTestMessageUrl(info)) {
        this.logger.log(`Preview email at: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`, err.stack);
    }
  }

  async sendSiteInviteEmail(payload: { siteId: string; siteName: string; inviterEmail: string; invitedEmail: string }) {
    const inviteLink = `http://localhost:5173/project/${payload.siteId}`;
    const subject = `${payload.inviterEmail} has invited you to join their project ${payload.siteName}`;
    
    // We parse the exact Postman HTML provided by the user, dynamically substituting our variables.
    const htmlBody = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="content-type" content="text/html; charset=UTF-8"><title>Genzite - Join Project</title><link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700" rel="stylesheet"><style type="text/css">.ReadMsgBody{width:100%;background-color:#fff}.ExternalClass{width:100%;background-color:#fff}body{width:100%;background-color:#fff;margin:0;padding:0;-webkit-font-smoothing:antialiased;font-family:Georgia,Times,serif}table{border-collapse:collapse}@media only screen and (max-width:640px){.deviceWidth{width:440px!important;padding:0}}@media only screen and (max-width:640px){.ImageWidth{width:50px!important;padding:0;margin:auto}}@media only screen and (max-width:640px){.center{text-align:center!important;margin:auto}}@media only screen and (max-width:479px){.deviceWidth{width:280px!important;padding:0}}@media only screen and (max-width:479px){.ImageWidth{width:50px!important;padding:0;margin:auto}}@media only screen and (max-width:479px){.center{text-align:center!important;margin:auto}}.container{width:100%!important;min-width:100%!important;height:auto!important}</style></head><body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" style="width:100%;background-color:#fff;margin:0;padding:0;-webkit-font-smoothing:antialiased;font-family:'Open Sans',sans-serif"><table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="container" style="border-collapse:collapse;width:100%;min-width:100%;height:auto"><tr><td width="100%" valign="top" bgcolor="#ffffff" style="padding-top:20px"><table width="580" class="deviceWidth" border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="#ffffff" style="margin:0 auto;border:1px solid #ededed;border-collapse:initial;padding:40px"><tr><td valign="top" style="padding:0" bgcolor="#ffffff"><h1 style="color:#000; font-family:'Open Sans',sans-serif;">Genzite</h1></td></tr><tr><td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:15px;font-family:'Open Sans',Arial,Helvetica,sans-serif"><p style="Margin:0;Margin-bottom:16px;color:#212121;font-size:24px;line-height:22px"><b>You're invited to project ${payload.siteName}</b></p><p style="Margin:0;Margin-bottom:16px;color:#212121;font-size:14px;line-height:22px">Hello there,</p><p style="Margin:0;Margin-bottom:16px;color:#212121;font-size:14px;line-height:22px"><strong>${payload.inviterEmail}</strong> has invited you to join their project <b>${payload.siteName}</b>. Join the project to start collaborating with team members in real-time.</p><table border="0" cellpadding="0" cellspacing="0" class="emailButton" style="border-collapse:collapse;border-radius:4px;margin-top:15px;margin-bottom:30px;border-spacing:0;font-family:Arial,Helvetica,sans-serif;color:#666;border-radius:3px;background-color:#ff6c37;display:inline-table;-webkit-text-size-adjust:none" bgcolor="#FF6C37"><tbody><tr><td valign="middle" class="emailButtonContent"><a class="fallback-text-button emailButtonText" target="_blank" style="display:inline-block;color:#fff;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:8px 12px" href="${inviteLink}">Accept Invite</a></td></tr></tbody></table><table style="border-collapse:collapse;width:100%" width="100%"><tbody><tr><td align="center" style="font-size:0;padding:0 0 16px;word-break:break-word"><p style="border-top:solid 1px #ededed;font-size:1px;margin:0 auto;width:100%"></p></td></tr><tr><td align="left" style="font-size:0;padding:0;word-break:break-word"><div style="font-family:Inter,Segoe UI,Roboto,Arial,verdana,geneva,sans-serif;font-size:12px;font-style:normal;font-weight:400;line-height:20px;text-align:left;color:#a6a6a6">© 2026 Genzite Inc. All Rights Reserved</div></td></tr></tbody></table></td></tr></table></td></tr></table><div style="height:15px;margin:0 auto"></div></body></html>
    `;

    await this.sendEmail(payload.invitedEmail, subject, `You're invited to project ${payload.siteName} by ${payload.inviterEmail}. Link: ${inviteLink}`, htmlBody);
  }

  async sendFeedbackEmail(payload: { siteId?: string; text: string; userEmail: string }) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@genzite.local';
    const subject = `New Feedback from ${payload.userEmail} for Site ${payload.siteId || 'Unknown'}`;
    const text = `User: ${payload.userEmail}\nSite ID: ${payload.siteId || 'None'}\n\nFeedback:\n${payload.text}`;
    const html = `<p><strong>User:</strong> ${payload.userEmail}</p><p><strong>Site ID:</strong> ${payload.siteId || 'None'}</p><hr/><p>${payload.text.replace(/\n/g, '<br/>')}</p>`;
    
    await this.sendEmail(adminEmail, subject, text, html);
  }
}
