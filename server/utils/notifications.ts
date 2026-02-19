import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Email configuration
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// SMS configuration
// SMS configuration
let twilioClient: any = null;
try {
    if (process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } else {
        console.warn('[SMS] Twilio credentials missing or invalid (SID must start with AC)');
    }
} catch (err) {
    console.warn('[SMS] Failed to initialize Twilio client:', err);
}

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export interface SMSOptions {
    to: string;
    message: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('[Email] SMTP credentials not configured');
            return false;
        }

        await emailTransporter.sendMail({
            from: `"ZDSPGC Enrollment" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        console.log(`[Email] Sent to ${options.to}`);
        return true;
    } catch (error) {
        console.error('[Email] Error:', error);
        return false;
    }
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
    try {
        if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
            console.warn('[SMS] Twilio not configured');
            return false;
        }

        await twilioClient.messages.create({
            body: options.message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: options.to,
        });

        console.log(`[SMS] Sent to ${options.to}`);
        return true;
    } catch (error) {
        console.error('[SMS] Error:', error);
        return false;
    }
}
