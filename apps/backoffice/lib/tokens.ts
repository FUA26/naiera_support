/**
 * Token Utilities
 *
 * Secure token generation and validation for password reset and email verification
 */

import crypto from "crypto";

/**
 * Generate a cryptographically secure random token
 */
function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generate a password reset token
 * Returns a 64-character hex string
 */
export function generatePasswordResetToken(): string {
  return generateRandomToken(32);
}

/**
 * Generate an email verification token
 * Returns a 64-character hex string
 */
export function generateVerificationToken(): string {
  return generateRandomToken(32);
}

/**
 * Hash a token for secure storage
 * Uses SHA-256 for one-way hashing
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Check if a token has expired
 * @param expires - The expiration date of the token
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(expires: Date | null | undefined): boolean {
  if (!expires) return true;

  const now = new Date();
  const expirationDate = new Date(expires);

  return now > expirationDate;
}

/**
 * Calculate token expiration date
 * @param hours - Number of hours until token expires
 * @returns Date object representing expiration time
 */
export function getTokenExpiration(hours: number = 1): Date {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Verify a token matches its hashed version
 * @param token - The plain text token
 * @param hashedToken - The stored hashed token
 * @returns true if tokens match
 */
export function verifyTokenHash(token: string, hashedToken: string): boolean {
  const hashedInput = hashToken(token);
  return hashedInput === hashedToken;
}

/**
 * Generate a secure token with its hash and expiration
 * Useful for creating and storing tokens
 */
export function createSecureToken(hours: number = 1) {
  const token = generateRandomToken(32);
  const hashed = hashToken(token);
  const expires = getTokenExpiration(hours);

  return {
    token,
    hashed,
    expires,
  };
}
