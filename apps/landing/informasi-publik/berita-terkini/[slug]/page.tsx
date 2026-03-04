import { notFound } from "next/navigation";
import { NewsDetailClient } from "./news-detail-client";
import { getNewsBySlug, getAllNews } from "@/lib/news-data";
import type { Metadata } from "next";

interface NewsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all news articles
export async function generateStaticParams() {
  const news = await getAllNews();
  return news.map((article) => ({
    slug: article.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  return {
    title: `${article.title} - Berita Terkini`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      images: [article.image],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  // Get related news (same category, excluding current article)
  const allNews = await getAllNews();
  const relatedNews = allNews
    .filter((news) => news.category === article.category && news.id !== article.id)
    .slice(0, 4);

  return (
    <NewsDetailClient article={article} relatedNews={relatedNews} />
  );
}
