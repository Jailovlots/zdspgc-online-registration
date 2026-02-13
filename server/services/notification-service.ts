import nodemailer from "nodemailer";
import twilio from "twilio";
import { storage } from "../storage";
import { type InsertNotification } from "@shared/schema";

// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Twilio configuration
let twilioClient: any;
try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && accountSid.startsWith("AC") && authToken && authToken !== "your_twilio_auth_token") {
        twilioClient = twilio(accountSid, authToken);
    } else {
        console.warn("[NotificationService] Twilio credentials not configured or invalid. SMS notifications will be disabled.");
    }
} catch (error) {
    console.warn("[NotificationService] Failed to initialize Twilio client:", error);
}

export class NotificationService {
    static async sendEmail(params: {
        to: string | string[];
        subject: string;
        message: string;
        adminId: number;
        studentIds?: number[];
    }) {
        const recipients = Array.isArray(params.to) ? params.to.join(", ") : params.to;

        try {
            await transporter.sendMail({
                from: `"ZDSPGC Enrollment" <${process.env.SMTP_USER}>`,
                to: Array.isArray(params.to) ? params.to : [params.to],
                subject: params.subject,
                html: params.message,
            });

            await storage.logNotification({
                type: "email",
                subject: params.subject,
                message: params.message,
                status: "sent",
                sentBy: params.adminId,
            });

            return { success: true };
        } catch (error: any) {
            console.error("Email sending failed:", error);

            await storage.logNotification({
                type: "email",
                subject: params.subject,
                message: params.message,
                status: "failed",
                sentBy: params.adminId,
            });

            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    static async sendSMS(params: {
        to: string | string[];
        message: string;
        adminId: number;
        studentIds?: number[];
    }) {
        if (!twilioClient) {
            console.warn("[NotificationService] Twilio client not initialized. SMS not sent.");
            await storage.logNotification({
                type: "sms",
                message: params.message,
                status: "failed",
                sentBy: params.adminId,
            });
            throw new Error("SMS service not configured");
        }

        const phoneNumbers = Array.isArray(params.to) ? params.to : [params.to];

        try {
            const results = await Promise.all(
                phoneNumbers.map((phone) =>
                    twilioClient.messages.create({
                        body: params.message,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: phone,
                    })
                )
            );

            await storage.logNotification({
                type: "sms",
                message: params.message,
                status: "sent",
                sentBy: params.adminId,
            });

            return { success: true, results };
        } catch (error: any) {
            console.error("SMS sending failed:", error);

            await storage.logNotification({
                type: "sms",
                message: params.message,
                status: "failed",
                sentBy: params.adminId,
            });

            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    }
}
