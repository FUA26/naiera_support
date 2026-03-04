/**
 * Revalidate API Route
 *
 * POST /api/revalidate - Revalidate cached pages after backoffice updates
 *
 * This endpoint is called by the backoffice when content is updated.
 * It clears in-memory cache and triggers Next.js ISR revalidation.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
// Services module removed - clearServicesCache no longer available

/**
 * Verify the request is from a trusted source
 * Uses a shared secret between backoffice and landing
 */
function verifyRequest(request: NextRequest): boolean {
  const secret = request.headers.get('x-revalidate-secret');
  const expectedSecret = process.env.REVALIDATE_SECRET || 'dev-secret-change-in-production';

  return secret === expectedSecret;
}

/**
 * POST /api/revalidate
 * Revalidate cached pages
 *
 * Body: {
 *   paths?: string[] - Optional array of paths to revalidate
 *   type?: 'services' | 'categories' | 'all' - Type of revalidation
 *   tag?: 'news' | 'events' | 'services' | 'all' - Tag-based revalidation
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a trusted source
    if (!verifyRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid revalidate secret' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { paths, type = 'all', tag } = body as { paths?: string[]; type?: string; tag?: string };

    // Handle tag-based revalidation (used by backoffice webhooks)
    if (tag) {
      switch (tag) {
        case 'news':
          // Revalidate all news-related paths
          revalidatePath('/api/public/news');
          revalidatePath('/informasi-publik/berita-terkini');
          revalidateTag('news');
          break;

        case 'events':
          // Revalidate all events-related paths
          revalidatePath('/api/public/events');
          revalidatePath('/informasi-publik/agenda-kegiatan');
          revalidateTag('events');
          break;

        case 'services':
          // Clear services in-memory cache
          // clearServicesCache(); // Services module removed
          revalidatePath('/layanan');
          revalidatePath('/api/public/services');
          revalidateTag('services');
          break;

        case 'all':
        default:
          // Revalidate everything
          // clearServicesCache(); // Services module removed
          revalidatePath('/');
          revalidatePath('/layanan');
          revalidatePath('/informasi-publik');
          revalidatePath('/informasi-publik/berita-terkini');
          revalidatePath('/informasi-publik/agenda-kegiatan');
          revalidatePath('/api/public/news');
          revalidatePath('/api/public/events');
          revalidatePath('/api/public/services');
          revalidateTag('news');
          revalidateTag('events');
          revalidateTag('services');
          break;
      }

      return NextResponse.json({
        success: true,
        revalidated: true,
        now: Date.now(),
        tag,
      });
    }

    // Clear in-memory cache for services
    // clearServicesCache(); // Services module removed

    // Revalidate specific paths if provided
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
      }
    } else {
      // Revalidate all service-related paths
      revalidatePath('/layanan');
      revalidatePath('/informasi-publik');
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      now: Date.now(),
      type,
    });
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Revalidation failed' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS
 */
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.BACKOFFICE_URL || 'http://localhost:3001',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-revalidate-secret',
    },
  });
};
