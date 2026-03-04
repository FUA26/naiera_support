import { render } from "@react-email/render";
import { ResendEmailService } from "./service/resend";
import { PasswordResetEmail } from "./templates/password-reset";
import { VerificationEmail } from "./templates/verification";
import { WelcomeEmail } from "./templates/welcome";

// Get email service instance
function getEmailService() {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  return new ResendEmailService(apiKey, defaultFrom);
}

export async function sendVerificationEmail(email: string, token: string) {
  const service = getEmailService();
  const appIdUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const html = await render(<VerificationEmail token={token} appIdUrl={appIdUrl} />);

  return service.send({
    to: email,
    subject: "Verify Your Email",
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const service = getEmailService();
  const appIdUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const html = await render(<PasswordResetEmail token={token} appIdUrl={appIdUrl} />);

  return service.send({
    to: email,
    subject: "Reset Your Password",
    html,
  });
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const service = getEmailService();
  const appIdUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Naiera";

  const html = await render(
    <WelcomeEmail userName={userName} appName={appName} appIdUrl={appIdUrl} />
  );

  return service.send({
    to: email,
    subject: `Welcome to ${appName}`,
    html,
  });
}
