import { NextResponse } from "next/server";
import { ApiError } from "../errors/api-error";
import { apiJsonError } from "../response/api-response";

export type ApiHandler = (req: Request, context?: unknown) => Promise<Response>;

export async function withErrorHandler(
  handler: ApiHandler
): Promise<Response> {
  try {
    return await handler.apply(null, arguments as unknown as any);
  } catch (error) {
    if (error instanceof ApiError) {
      return apiJsonError(error);
    }
    return apiJsonError(error as Error);
  }
}

export function withApiHandler(handler: ApiHandler): ApiHandler {
  return async (req: Request, context?: unknown) => {
    return withErrorHandler(handler.bind(null, req, context));
  };
}
