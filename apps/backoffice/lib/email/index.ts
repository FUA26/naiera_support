export * from "./service/email-service";
export * from "./service/resend";
export * from "./types";
export { sendTemplate, clearTemplateCache } from "./sender";

// Keep old exports for backward compatibility (will be removed)
export { PasswordResetEmail } from "./templates/password-reset";
export { VerificationEmail } from "./templates/verification";
export { WelcomeEmail } from "./templates/welcome";
export * from "./utils";
