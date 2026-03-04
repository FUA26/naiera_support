// Types for destination data structure
export interface Destination {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  categorySlug: string;
  categoryIcon: string | null;
  image: string | null;
  location: string | null;
  rating: number | null;
  reviewsCount: number;
  priceInfo: string | null;
  openHours: string | null;
  featured: boolean;
  facilities?: Array<{ name: string; icon: string | null }>;
  images?: Array<{ url: string; caption: string | null }>;
}

export interface DestinationCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  destinationCount: number;
}

const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';

/**
 * Fetch all destinations
 */
export async function getAllDestinations(options: { 
  category?: string; 
  featured?: boolean;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ items: Destination[], total: number }> {
  const { category, featured, page = 1, pageSize = 20 } = options;
  let url = `${BACKOFFICE_URL}/api/public/destinations?page=${page}&pageSize=${pageSize}`;
  if (category) url += `&category=${category}`;
  if (featured) url += `&featured=true`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600, tags: ['destinations'] }
    });
    if (!res.ok) return { items: [], total: 0 };
    return await res.json();
  } catch (error) {
    console.error('Error loading destinations:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch featured destinations
 */
export async function getFeaturedDestinations(): Promise<Destination[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/destinations/featured`, {
      next: { revalidate: 3600, tags: ['destinations'] }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error loading featured destinations:', error);
    return [];
  }
}

/**
 * Fetch all destination categories
 */
export async function getDestinationCategories(): Promise<DestinationCategory[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/destinations/categories`, {
      next: { revalidate: 3600, tags: ['destinations'] }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error loading destination categories:', error);
    return [];
  }
}

/**
 * Fetch destination by slug
 */
export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/destinations/${slug}`, {
      next: { revalidate: 3600, tags: ['destinations'] }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error loading destination ${slug}:`, error);
    return null;
  }
}
