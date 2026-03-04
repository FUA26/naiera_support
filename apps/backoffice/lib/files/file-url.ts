/**
 * File URL Helper Functions
 *
 * Enforces proxy pattern for file access.
 * All front-end file access MUST go through Next.js proxy API,
 * NOT direct MinIO URLs (which cause connection timeouts).
 *
 * TECH DEBT: Database File model stores 'cdnUrl' field with direct
 * MinIO URL, but we don't use it in front-end. This is kept for
 * admin/internal use only. Use getFileServeUrl() instead.
 */

/**
 * Get the proper URL for serving a file through Next.js proxy
 *
 * @param fileId - The file ID from database
 * @returns Proxy API URL (e.g., /api/files/cmlf6p4mo00009l3jo81imqki/serve)
 *
 * @example
 * ```tsx
 * <img src={getFileServeUrl(file.id)} alt="File" />
 * ```
 */
export function getFileServeUrl(fileId: string): string {
  if (!fileId) {
    throw new Error("getFileServeUrl: fileId is required");
  }
  return `/api/files/${fileId}/serve`;
}

/**
 * Transform file object to include proxy URL
 *
 * Use this when you have a file object from database and need to
 * pass it to a React component that displays the file.
 *
 * @param file - File object with at least { id: string }
 * @returns File object with additional 'url' property containing proxy URL
 *
 * @example
 * ```ts
 * const file = await prisma.file.findUnique({ where: { id } });
 * const fileWithUrl = transformFileUrl(file);
 * // Now component can use fileWithUrl.url
 * ```
 */
export function transformFileUrl<T extends { id: string }>(file: T): T & { url: string } {
  if (!file?.id) {
    throw new Error("transformFileUrl: file.id is required");
  }
  return {
    ...file,
    url: getFileServeUrl(file.id),
  };
}

/**
 * Check if a file URL is a proxy URL (not direct MinIO URL)
 *
 * @param url - URL to check
 * @returns true if URL is a proxy API URL
 *
 * @example
 * ```ts
 * if (isProxyUrl(fileUrl)) {
 *   // Good! This is the proxy pattern
 * } else {
 *   // Bad! This might be a direct MinIO URL
 * }
 * ```
 */
export function isProxyUrl(url: string): boolean {
  return url.startsWith("/api/files/") && url.includes("/serve");
}
