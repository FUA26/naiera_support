import { NextResponse } from "next/server";
import { ApiError } from "../errors/api-error";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(
  data: T,
  meta?: ApiSuccessResponse<T>["meta"]
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function apiError(error: Error | ApiError): ApiErrorResponse {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  return {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred",
    },
  };
}

export function apiJson<T>(
  data: T,
  meta?: ApiSuccessResponse<T>["meta"],
  status: number = 200
): NextResponse {
  return NextResponse.json(apiSuccess(data, meta), { status });
}

export function apiJsonError(error: Error | ApiError, status?: number): NextResponse {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  return NextResponse.json(apiError(error), { status: status || statusCode });
}
