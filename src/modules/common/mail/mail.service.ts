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
    const verificationUrl = `${process.env.APP_URL}/en/verification/?key=${token}`;
    console.log(process.env.SMTP_EMAIL, process.env.SMTP_PASSWORD);
    console.log(verificationUrl);
    console.log(process.env.MAIL_PORT, process.env.MAIL_HOST);
    console.log('sending to' + email);
    const mailOptions = {
      from: '"Greenteam" <noreply@greenteam.com>',
      to: email,
      subject: 'Please verify your email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Greenteam!</h2>
          <p>Thank you for joining Greenteam. Please verify your email address by clicking the button below:</p>
          <div style="margin: 20px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #006633; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px;">
              Verify Your Email
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationUrl}</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <p>Best regards,<br>Greenteam Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('email sent');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.APP_URL}/auth/reset-password/?key=${token}`;

    const mailOptions = {
      from: '"Greenteam" <noreply@greenteam.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background-color: #006633; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Greenteam Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
