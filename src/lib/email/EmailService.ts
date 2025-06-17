import "dotenv/config";

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * A service for sending emails using Nodemailer.
 */
export class EmailService {
  private transporter: Transporter;

  constructor() {
    // Configure Nodemailer transporter
    // Use environment variables for sensitive information
    if (
      !process.env.PRIVATE_MAIL_SMTP_HOST ||
      !process.env.PRIVATE_MAIL_SMTP_PORT ||
      !process.env.PRIVATE_MAIL_SMTP_USER ||
      !process.env.PRIVATE_MAIL_SMTP_PASS
    ) {
      console.error(
        "SMTP environment variables are not fully configured. Email sending may fail."
      );
      // Depending on requirements, you might want to throw an error here
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.PRIVATE_MAIL_SMTP_HOST,
      port: parseInt(process.env.PRIVATE_MAIL_SMTP_PORT || "587", 10), // Default SMTP port
      secure: process.env.PRIVATE_MAIL_SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.PRIVATE_MAIL_SMTP_USER,
        pass: process.env.PRIVATE_MAIL_SMTP_PASS,
      },
      // Optional: Add TLS options if needed
      // tls: {
      //   rejectUnauthorized: false
      // }
    });

    // console.log("EmailService initialized with Nodemailer.");
  }

  /**
   * Sends a business welcome email to a new user.
   * @param email The recipient's email address.
   * @param name The recipient's name.
   */
  async sendBusinessWelcomeEmail(email: string, name?: string): Promise<void> {
    // console.log(`Attempting to send welcome email to ${name || email}...`);

    const subject = "Welcome to the Checkaroundme family!";
    const textBody = `
Sharp ${name || "there"}
Welcome to the Checkaroundme family! We’re excited to have you onboard as a service provider :tada:
At Checkaroundme, our mission is simple — to help skilled professionals like you get discovered, build trust, and grow your business without the middlemen.
Here’s what you can start doing right away:
- Complete Your Profile – Add photos, describe your service, and stand out.
- Set Your Location – So nearby clients can find you easily.
- Share Your Page – Spread the word on social media and invite your customers to leave reviews.
- Respond Fast – Reply quickly to messages and job inquiries to build trust.
🚀 LAUNCH BONUS: You’ve unlocked our promo – Pay for 1 month, get 2 MONTHS FREE. More time to get noticed, more chances to get hired.
🎬 Watch a quick tutorial here:
https://youtu.be/e9lEAZnr9So
If you have any questions or need help, our team is just an email away at support@checkaroundme.com or message us via the app.
Thanks again for joining — let’s help more people Find. Trust. Hire.
Warm regards,
The Checkaroundme Team
    `.trim();

    // Basic HTML structure inspired by a card component
    const htmlBody = `
<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
  <div style="text-align: center; margin-bottom: 20px;">
    <!-- Optional: Add a logo image here if you have one hosted -->
    <!-- <img src="[URL_TO_YOUR_LOGO]" alt="Checkaroundme Logo" style="max-width: 150px; margin-bottom: 10px;"> -->
    <h1 style="font-size: 24px; color: #333; margin: 0;">Welcome to the Checkaroundme family!</h1>
  </div>
  <p>Sharp ${name || "there"},</p>
  <p>We’re excited to have you onboard as a service provider 🎉</p>
  <p>At Checkaroundme, our mission is simple — to help skilled professionals like you get discovered, build trust, and grow your business without the middlemen.</p>
  <p><strong>Here’s what you can start doing right away:</strong></p>
  <ul style="padding-left: 20px;">
    <li style="margin-bottom: 10px;">✅ <strong>Complete Your Profile</strong> – Add photos, describe your service, and stand out.</li>
    <li style="margin-bottom: 10px;">✅ <strong>Set Your Location</strong> – So nearby clients can find you easily.</li>
    <li style="margin-bottom: 10px;">✅ <strong>Share Your Page</strong> – Spread the word on social media and invite your customers to leave reviews.</li>
    <li style="margin-bottom: 10px;">✅ <strong>Respond Fast</strong> – Reply quickly to messages and job inquiries to build trust.</li>
  </ul>
  <p>🚀 <strong>LAUNCH BONUS:</strong> You’ve unlocked our promo – Pay for 1 month, get 2 MONTHS FREE. More time to get noticed, more chances to get hired.</p>
  <p>🎬 Watch a quick tutorial here:<br>
  <a href="https://youtu.be/e9lEAZnr9So" style="color: #007bff; text-decoration: none;">https://youtu.be/e9lEAZnr9So</a></p>
  <p>If you have any questions or need help, our team is just an email away at <a href="mailto:support@checkaroundme.com" style="color: #007bff; text-decoration: none;">support@checkaroundme.com</a> or message us via the app.</p>
  <p>Thanks again for joining — let’s help more people Find. Trust. Hire.</p>
  <p>Warm regards,<br>
  The Checkaroundme Team</p>
</div>
    `.trim();

    const mailOptions = {
      from:
        process.env.PRIVATE_MAIL_SMTP_FROM_EMAIL ||
        '"Checkaroundme" <noreply@checkaroundme.com>', // Sender address
      to: email, // List of recipients
      subject: subject, // Subject line
      text: textBody, // Plain text body
      html: htmlBody, // HTML body
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        `Welcome email sent successfully to ${email}: ${info.messageId}`
      );
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
      // Depending on requirements, you might want to retry or log this error
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Sends a welcome email to a new user (service seeker).
   * @param email The recipient's email address.
   * @param name The recipient's name.
   */
  async sendUserWelcomeEmail(email: string, name?: string): Promise<void> {
    // console.log(`Attempting to send user welcome email to ${name || email}...`);

    const subject =
      "Welcome to Checkaroundme - Your Gateway to Local Services!";
    const textBody = `
Hey ${name || "there"}!

You just entered the real zone! where hustlers shine and clients find the best hands in town.

🔧 Service Providers, we see you!
Whether you fix nails, paint walls, style hair, clean spaces or build empires, this is YOUR spotlight.
Upload your work, drop your details, and let your talent speak loud! Clients dey wait to book you. No dulling!

🔍 Service Users, you're covered!
Need a plug that shows up, delivers, and gets the job done?
Search, connect, chat, and rate your provider easy peasy.

This is not just another platform.
This is "CheckAroundMe" where the streets and skills connect! 💥

Let's blow up your hustle. Let's get that bag.
👇
🌍 www.checkaroundme.com

Best regards,
The Checkaroundme Team
    `.trim();

    const htmlBody = `
<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="font-size: 24px; color: #333; margin: 0;">Welcome to Checkaroundme!</h1>
  </div>
  
  <p>Hey ${name || "there"}!</p>
  
  <p>You just entered the real zone! where hustlers shine and clients find the best hands in town.</p>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;">
    <p><strong>🔧 Service Providers, we see you!</strong></p>
    <p>Whether you fix nails, paint walls, style hair, clean spaces or build empires, this is YOUR spotlight.</p>
    <p>Upload your work, drop your details, and let your talent speak loud! Clients dey wait to book you. No dulling!</p>
  </div>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;">
    <p><strong>🔍 Service Users, you're covered!</strong></p>
    <p>Need a plug that shows up, delivers, and gets the job done?</p>
    <p>Search, connect, chat, and rate your provider easy peasy.</p>
  </div>
  
  <p><strong>This is not just another platform.</strong></p>
  <p>This is "CheckAroundMe" where the streets and skills connect! 💥</p>
  
  <p>Let's blow up your hustle. Let's get that bag.</p>
  
  <div style="text-align: center; margin: 20px 0;">
    <p>👇</p>
    <a href="https://www.checkaroundme.com" style="color: #007bff; text-decoration: none; font-weight: bold;">🌍 www.checkaroundme.com</a>
  </div>
  
  <p>Best regards,<br>
  The Checkaroundme Team</p>
</div>
    `.trim();

    const mailOptions = {
      from:
        process.env.PRIVATE_MAIL_SMTP_FROM_EMAIL ||
        '"Checkaroundme" <noreply@checkaroundme.com>',
      to: email,
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        `User welcome email sent successfully to ${email}: ${info.messageId}`
      );
    } catch (error) {
      console.error(`Failed to send user welcome email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Sends an email notification when a user receives a new message.
   * @param email The recipient's email address
   * @param senderName The name of the person who sent the message
   * @param messagePreview A preview of the message content
   */
  async sendMessageNotificationEmail(
    email: string,
    senderName: string,
    messagePreview: string
  ): Promise<void> {
    const subject = `New Message from ${senderName} on Checkaroundme`;
    const textBody = `
Hi there,

You have received a new message from ${senderName} on Checkaroundme.

Message preview:
${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? "..." : ""}

Login to your account to view and respond to this message:
https://checkaroundme.com/messages

Best regards,
The Checkaroundme Team
    `.trim();

    const htmlBody = `
<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="font-size: 24px; color: #333; margin: 0;">New Message on Checkaroundme</h1>
  </div>
  
  <p>Hi there,</p>
  
  <p>You have received a new message from <strong>${senderName}</strong> on Checkaroundme.</p>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;">
    <p><strong>Message preview:</strong></p>
    <p style="color: #666;">${messagePreview.substring(0, 100)}${
      messagePreview.length > 100 ? "..." : ""
    }</p>
  </div>
  
  <div style="text-align: center; margin: 20px 0;">
    <a href="https://checkaroundme.com/messages" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Message</a>
  </div>
  
  <p>Best regards,<br>
  The Checkaroundme Team</p>
</div>
    `.trim();

    const mailOptions = {
      from:
        process.env.PRIVATE_MAIL_SMTP_FROM_EMAIL ||
        '"Checkaroundme" <noreply@checkaroundme.com>',
      to: email,
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        `Message notification email sent successfully to ${email}: ${info.messageId}`
      );
    } catch (error) {
      console.error(
        `Failed to send message notification email to ${email}:`,
        error
      );
      throw error;
    }
  }
}

export const emailService = new EmailService();

// await emailService.sendUserWelcomeEmail("iamthraize@gmail.com", "Thraize");
// await emailService.sendBusinessWelcomeEmail("iamthraize@gmail.com", "Thraize");
