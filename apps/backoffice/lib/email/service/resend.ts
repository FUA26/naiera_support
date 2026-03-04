import { Resend } from "resend";
import type { EmailData, EmailResult, EmailService } from "./email-service";

export class ResendEmailService implements EmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string) {
    this.resend = new Resend(apiKey);
    this.defaultFrom = defaultFrom;
  }

  async send(data: EmailData): Promise<EmailResult> {
    try {
      const result = await this.resend.emails.send({
        from: data.from || this.defaultFrom,
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
        html: data.html,
        replyTo: data.replyTo,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async bulkSend(data: EmailData[]): Promise<EmailResult[]> {
    return Promise.all(data.map((item) => this.send(item)));
  }
}
