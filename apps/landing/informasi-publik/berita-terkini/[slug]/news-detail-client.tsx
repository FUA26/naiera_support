"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  Printer,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Tag,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { NewsArticle } from "@/lib/news-data";

interface NewsDetailClientProps {
  article: NewsArticle;
  relatedNews: NewsArticle[];
}

export function NewsDetailClient({ article, relatedNews }: NewsDetailClientProps) {
  const t = useTranslations("NewsDetail");
  const locale = useLocale();
  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(dateLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article.title);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
  };

  return (
    <main className="bg-muted">
      {/* Breadcrumb */}
      <div className="bg-background border-b">
        <div className="container mx-auto max-w-6xl px-4">
          <nav className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
            <Link href="/" className="hover:text-primary">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/informasi-publik" className="hover:text-primary">
              Informasi Publik
            </Link>
            <span>/</span>
            <Link
              href="/informasi-publik/berita-terkini"
              className="hover:text-primary"
            >
              Berita Terkini
            </Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section - Featured Image */}
      <div className="bg-background border-b">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="py-8">
            <Link
              href="/informasi-publik/berita-terkini"
              className="text-muted-hover text-muted-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} />
              Kembali ke Berita Terkini
            </Link>

            {/* Category Badge */}
            <div className="mb-4">
              <span className="bg-info-light text-info rounded-full px-4 py-2 text-sm font-semibold">
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-foreground mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="border-border flex flex-wrap items-center gap-6 border-t pt-6 text-sm md:text-base">
              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar size={18} />
                <span>{formatDate(article.date)}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <User size={18} />
                <span>{article.author}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Clock size={18} />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Article */}
            <div className="lg:col-span-2">
              {/* Featured Image */}
              <div className="from-primary-light to-primary-lighter bg-gradient-to-br relative mb-8 aspect-video overflow-hidden rounded-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <Calendar size={64} className="mx-auto mb-3" />
                    <p className="text-lg font-semibold">Gambar Berita</p>
                    <p className="text-sm opacity-70">{article.image}</p>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="border-border bg-card mb-8 rounded-xl border p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-foreground font-semibold">Bagikan:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare("facebook")}
                      className="hover:bg-blue-50 hover:text-blue-600 text-muted-foreground rounded-lg p-2 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook size={20} />
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="hover:bg-sky-50 hover:text-sky-600 text-muted-foreground rounded-lg p-2 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <Twitter size={20} />
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="hover:bg-blue-50 hover:text-blue-700 text-muted-foreground rounded-lg p-2 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin size={20} />
                    </button>
                    <button
                      onClick={copyLink}
                      className="hover:bg-gray-50 hover:text-gray-600 text-muted-foreground rounded-lg p-2 transition-colors"
                      aria-label="Copy link"
                    >
                      <LinkIcon size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="hover:bg-primary-light hover:text-primary text-muted-foreground rounded-lg p-2 transition-colors"
                      aria-label="Bookmark"
                    >
                      <Bookmark size={20} />
                    </button>
                    <button
                      className="hover:bg-primary-light hover:text-primary text-muted-foreground rounded-lg p-2 transition-colors"
                      aria-label="Print"
                      onClick={() => window.print()}
                    >
                      <Printer size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <article className="bg-card prose prose-lg max-w-none rounded-2xl p-8 shadow-sm dark:prose-invert">
                <h2 className="text-foreground mb-4 text-2xl font-bold">
                  Ringkasan
                </h2>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  {article.excerpt}
                </p>

                <div className="border-border my-8 border-t" />

                <h3 className="text-foreground mb-4 text-xl font-bold">
                  Informasi Lengkap
                </h3>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                  enim ad minim veniam, quis nostrud exercitation ullamco laboris
                  nisi ut aliquip ex ea commodo consequat.
                </p>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>

                <h4 className="text-foreground mb-3 mt-8 text-lg font-bold">
                  Poin Penting
                </h4>
                <ul className="list-disc space-y-2 pl-6">
                  <li className="text-muted-foreground">
                    Implementasi sistem informasi daerah yang terintegrasi
                  </li>
                  <li className="text-muted-foreground">
                    Peningkatan pelayanan publik berbasis digital
                  </li>
                  <li className="text-muted-foreground">
                    Transparansi dan akuntabilitas pemerintahan
                  </li>
                  <li className="text-muted-foreground">
                    Partisipasi aktif masyarakat dalam pembangunan
                  </li>
                </ul>

                <div className="border-border bg-muted my-8 rounded-xl border p-6">
                  <p className="text-foreground font-semibold mb-2">
                    Kutipan Terkait
                  </p>
                  <p className="text-muted-foreground italic">
                    "Inovasi dalam pelayanan publik adalah kunci untuk mewujudkan
                    pemerintahan yang transparan, akuntabel, dan melayani
                    masyarakat dengan prima."
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    — Pemerintah Daerah
                  </p>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="border-border border-t pt-6 mt-8">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag size={18} className="text-muted-foreground" />
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-muted text-muted-foreground rounded-lg px-3 py-1 text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Author Card */}
              <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
                <h3 className="text-foreground mb-4 font-bold">Penulis</h3>
                <div className="flex items-center gap-4">
                  <div className="bg-primary-lighter text-primary flex h-12 w-12 items-center justify-center rounded-full font-bold">
                    {article.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      {article.author}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {article.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
                <h3 className="text-foreground mb-4 font-bold">Informasi</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dipublikasikan</span>
                    <span className="text-foreground font-medium">
                      {formatDate(article.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kategori</span>
                    <span className="text-foreground font-medium">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waktu Baca</span>
                    <span className="text-foreground font-medium">
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related News */}
              {relatedNews.length > 0 && (
                <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
                  <h3 className="text-foreground mb-4 font-bold">
                    Berita Terkait
                  </h3>
                  <div className="space-y-4">
                    {relatedNews.map((news) => (
                      <Link
                        key={news.id}
                        href={`/informasi-publik/berita-terkini/${news.slug}`}
                        className="block group"
                      >
                        <div className="mb-2 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-primary-light to-primary-lighter">
                          <Calendar className="text-primary/60" size={32} />
                        </div>
                        <h4 className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-semibold transition-colors">
                          {news.title}
                        </h4>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {news.date}
                        </p>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/informasi-publik/berita-terkini"
                    className="text-primary hover:text-primary-hover mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                  >
                    Lihat Semua Berita
                    <Share2 size={16} />
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
