import { z } from "zod";

export const emailValidator = z.string().min(1, "Email is required").email("Invalid email address");

export const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneValidator = z.string().regex(/^[+]?[\d\s-()]+$/, "Invalid phone number");

export const urlValidator = z.string().url("Invalid URL");

export const requiredString = (fieldName: string) => z.string().min(1, `${fieldName} is required`);

export const optionalString = () => z.string().optional();
