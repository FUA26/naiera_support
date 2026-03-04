import { NewsSectionClient } from './news-section-client';
import { getRecentNews } from '@/lib/news-data';

/**
 * Server Component wrapper for NewsSection
 * Fetches news data from directories and passes to client component
 */
export async function NewsSection() {
  // Fetch news data from directories
  const newsArticles = await getRecentNews(4);

  return <NewsSectionClient newsArticles={newsArticles} />;
}
