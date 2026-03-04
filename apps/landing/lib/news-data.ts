// Types for news data structure
export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  categorySlug?: string;
  categoryColor?: string;
  date: string;
  image: string | null;
  author: string | null;
  readTime: string | null;
  featured: boolean;
  tags: string[];
}

const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';

/**
 * Fetch all news articles
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news`, {
      next: { revalidate: 3600 } // Cache 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error loading news articles:', error);
    return [];
  }
}

/**
 * Fetch featured news articles
 */
export async function getFeaturedNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news?featured=true`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error loading featured news:', error);
    return [];
  }
}

/**
 * Fetch recent news articles (limit)
 */
export async function getRecentNews(limit: number = 6): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news?limit=${limit}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error loading recent news:', error);
    return [];
  }
}

/**
 * Fetch news by category
 */
export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news?category=${category}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error loading news for category ${category}:`, error);
    return [];
  }
}

/**
 * Fetch a single news article by slug
 */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error loading news article ${slug}:`, error);
    return null;
  }
}

/**
 * Get all unique news categories
 */
export async function getNewsCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news/categories`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const categories = await res.json();
    return categories.map((c: any) => c.name);
  } catch (error) {
    console.error('Error loading news categories:', error);
    return [];
  }
}

/**
 * Get categories with full details
 */
export async function getNewsCategoriesWithDetails(): Promise<Array<{
  id: string;
  name: string;
  slug: string;
  color: string;
  order: number;
}>> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news/categories`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error loading news categories:', error);
    return [];
  }
}
