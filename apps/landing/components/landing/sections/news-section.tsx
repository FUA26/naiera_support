"use client";

import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  author: string;
  readTime: string;
}

export function NewsSection() {
  const t = useTranslations("News");
  const locale = useLocale();
  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(dateLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  const newsArticles: NewsArticle[] = [
    {
      id: "1",
      title: t("items.news1.title"),
      excerpt: t("items.news1.desc"),
      category: t("items.news1.category"),
      date: formatDate("2026-01-05"),
      image: "/images/news-1.jpg",
      author: t("items.news1.author"),
      readTime: t("readTime", { minutes: 3 }),
    },
    {
      id: "2",
      title: t("items.news2.title"),
      excerpt: t("items.news2.desc"),
      category: t("items.news2.category"),
      date: formatDate("2026-01-04"),
      image: "/images/news-2.jpg",
      author: t("items.news2.author"),
      readTime: t("readTime", { minutes: 4 }),
    },
    {
      id: "3",
      title: t("items.news3.title"),
      excerpt: t("items.news3.desc"),
      category: t("items.news3.category"),
      date: formatDate("2026-01-03"),
      image: "/images/news-3.jpg",
      author: t("items.news3.author"),
      readTime: t("readTime", { minutes: 5 }),
    },
  ];

  return (
    <section className="bg-background py-16 md:py-20" id="berita">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <span className="bg-info-light text-info mb-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
              {t("label")}
            </span>
            <h2 className="text-foreground mb-3 text-3xl font-bold md:text-4xl">
              {t("title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
              {t("description")}
            </p>
          </div>
          <a
            href="#semua-berita"
            className="group text-primary hover:text-primary-hover hidden items-center gap-2 font-semibold transition-colors md:inline-flex"
          >
            {t("viewAll")}
            <ArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>

        {/* Featured News */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Main Featured */}
          {newsArticles[0] && (
            <NewsCard article={newsArticles[0]} featured tRead={t("read")} />
          )}

          {/* Secondary News */}
          <div className="space-y-6">
            {newsArticles.slice(1).map((article) => (
              <NewsCardCompact key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Mobile View All Link */}
        <div className="text-center md:hidden">
          <a
            href="#semua-berita"
            className="group text-primary hover:text-primary-hover inline-flex items-center gap-2 font-semibold transition-colors"
          >
            {t("viewAllMobile")}
            <ArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
  tRead?: string;
}

function NewsCard({ article, tRead }: NewsCardProps) {
  return (
    <a
      href={`#berita/${article.id}`}
      className="group border-border bg-card block overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image */}
      <div className="from-primary-light relative h-64 overflow-hidden bg-gradient-to-br to-blue-100">
        {/* Placeholder gradient - replace with actual image when available */}
        <div className="from-primary absolute inset-0 bg-gradient-to-br to-blue-500 opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/80">
            <Calendar size={48} className="mx-auto mb-2" />
            <p className="text-sm">Gambar Berita</p>
          </div>
        </div>
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="text-primary rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="group-hover:text-primary text-foreground mb-3 line-clamp-2 text-xl font-bold transition-colors">
          {article.title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="border-border text-muted-foreground flex items-center justify-between border-t pt-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {article.readTime}
            </span>
          </div>
          <span className="text-primary font-semibold opacity-0 transition-opacity group-hover:opacity-100">
            {tRead} →
          </span>
        </div>
      </div>
    </a>
  );
}

function NewsCardCompact({ article }: NewsCardProps) {
  return (
    <a
      href={`#berita/${article.id}`}
      className="group hover:border-primary/30 border-border bg-card flex gap-4 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="from-primary-light relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br to-blue-100">
        <div className="from-primary absolute inset-0 bg-gradient-to-br to-blue-500 opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Calendar size={24} className="text-white/60" />
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <span className="bg-info-light text-info mb-2 inline-block rounded px-2 py-1 text-xs font-semibold">
          {article.category}
        </span>
        <h4 className="group-hover:text-primary text-foreground mb-2 line-clamp-2 font-bold transition-colors">
          {article.title}
        </h4>
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </a>
  );
}
