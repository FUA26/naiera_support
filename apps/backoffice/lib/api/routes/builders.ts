import { auth } from "@/lib/auth/config";
import { NextRequest } from "next/server";
import { ZodSchema } from "zod";
import { RateLimitError, UnauthorizedError, ValidationError } from "../errors/api-error";
import type { RateLimiter, RateLimitResult } from "../middleware/rate-limit";

export interface ApiHandlerContext {
  body?: unknown;
  user?: unknown;
  session?: unknown;
}

export type ApiHandler = (req: NextRequest, context: ApiHandlerContext) => Promise<Response>;

export function withValidation<T>(schema: ZodSchema<T>) {
  return function <U extends ApiHandler>(
    handler: U
  ): (req: NextRequest, context: ApiHandlerContext) => Promise<Response> {
    return async (req: NextRequest, context: ApiHandlerContext) => {
      try {
        const body = await req.json();
        const validated = schema.parse(body);
        context.body = validated;
        return handler(req, context);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new ValidationError(error.message || "Validation failed", error);
        }
        throw new ValidationError("Validation failed", error);
      }
    };
  };
}

export function withAuth() {
  return function <U extends ApiHandler>(
    handler: U
  ): (req: NextRequest, context: ApiHandlerContext) => Promise<Response> {
    return async (req: NextRequest, context: ApiHandlerContext) => {
      const session = await auth();

      if (!session?.user) {
        throw new UnauthorizedError();
      }

      context.session = session;
      context.user = session.user;

      return handler(req, context);
    };
  };
}

export function withRateLimit(limiter: RateLimiter) {
  return function <U extends ApiHandler>(
    handler: U
  ): (req: NextRequest, context: ApiHandlerContext) => Promise<Response> {
    return async (req: NextRequest, context: ApiHandlerContext) => {
      const identifier = req.headers.get("x-forwarded-for") || "unknown";
      const result: RateLimitResult = await limiter.check(identifier);

      if (!result.allowed) {
        throw new RateLimitError();
      }

      return handler(req, context);
    };
  };
}
