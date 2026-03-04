// Types for gallery data structure
export interface Photo {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  album: string | null;
  albumSlug: string | null;
  image: string | null;
  location: string | null;
  photographer: string | null;
  views: number;
  likes: number;
  date: string;
  featured: boolean;
  tags: string[];
}

export interface PhotoAlbum {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  photoCount: number;
  photos?: Photo[];
}

const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';

/**
 * Fetch all photos
 */
export async function getAllPhotos(page: number = 1, pageSize: number = 20): Promise<{ items: Photo[], total: number }> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/photos?page=${page}&pageSize=${pageSize}`, {
      next: { revalidate: 3600, tags: ['gallery'] }
    });
    if (!res.ok) return { items: [], total: 0 };
    return await res.json();
  } catch (error) {
    console.error('Error loading photos:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch featured photos
 */
export async function getFeaturedPhotos(limit: number = 6): Promise<Photo[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/photos?featured=true&limit=${limit}`, {
      next: { revalidate: 3600, tags: ['gallery'] }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error loading featured photos:', error);
    return [];
  }
}

/**
 * Fetch photos by album
 */
export async function getPhotosByAlbum(albumSlug: string): Promise<Photo[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/photos?album=${albumSlug}`, {
      next: { revalidate: 3600, tags: ['gallery'] }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error loading photos for album ${albumSlug}:`, error);
    return [];
  }
}

/**
 * Fetch all albums
 */
export async function getAllAlbums(): Promise<PhotoAlbum[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/albums`, {
      next: { revalidate: 3600, tags: ['gallery'] }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error loading albums:', error);
    return [];
  }
}

/**
 * Fetch album by slug
 */
export async function getAlbumBySlug(slug: string): Promise<PhotoAlbum | null> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/albums/${slug}`, {
      next: { revalidate: 3600, tags: ['gallery'] }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error loading album ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch photo by slug
 */
export async function getPhotoBySlug(slug: string): Promise<Photo | null> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/photos/${slug}`, {
      next: { revalidate: 3600, tags: ['gallery'] }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error loading photo ${slug}:`, error);
    return null;
  }
}
