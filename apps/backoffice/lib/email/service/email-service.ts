export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface EmailService {
  send(data: EmailData): Promise<EmailResult>;
  bulkSend(data: EmailData[]): Promise<EmailResult[]>;
}
