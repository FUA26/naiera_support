export interface ApiErrorDetails {
  [key: string]: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: ApiErrorDetails
  ) {
    super(message);
    this.name = "ApiError";
  }
}
