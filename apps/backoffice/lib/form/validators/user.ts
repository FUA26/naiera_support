import { z } from "zod";
import { emailValidator, passwordValidator } from "./common";

export const userNameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: emailValidator,
});

export const userPasswordSchema = z
  .object({
    password: passwordValidator,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const createUserSchema = userNameSchema.extend({
  password: passwordValidator,
  roleId: z.string().min(1, "Role is required"),
});

export const updateUserSchema = userNameSchema.partial().extend({
  id: z.string(),
});

export const changePasswordSchema = userPasswordSchema;
