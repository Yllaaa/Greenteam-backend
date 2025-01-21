import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.APP_URL}/auth/verify/${token}`;

    const mailOptions = {
      from: '"Your App" <noreply@greenteam.com>',
      to: email,
      subject: 'Please verify your email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Your App!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="margin: 20px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationUrl}</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <p>Best regards,<br>Your App Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}
