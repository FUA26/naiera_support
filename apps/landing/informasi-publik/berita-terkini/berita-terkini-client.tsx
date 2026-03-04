"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  Tag,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { NewsArticle } from "@/lib/news-data";

interface BeritaTerkiniClientProps {
  allNews: NewsArticle[];
  categories: string[];
}

export function BeritaTerkiniClient({
  allNews,
  categories,
}: BeritaTerkiniClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Add "Semua" to categories
  const allCategories = ["Semua", ...categories];

  // Get featured news
  const featuredNews = useMemo(
    () => allNews.filter((a) => a.featured),
    [allNews]
  );

  // Filter news based on search and category
  const filteredNews = useMemo(() => {
    return allNews.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Semua" || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allNews, searchQuery, selectedCategory]);

  // Get popular news (sorted by... you could add a views field)
  const popularArticles = useMemo(() => {
    return allNews.slice(0, 5);
  }, [allNews]);

  return (
    <main className="bg-muted">
      {/* Hero Section */}
      <section className="from-primary to-primary-hover bg-gradient-to-br py-12 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <nav className="text-primary-lighter mb-4 flex items-center gap-2 text-sm">
            <Link href="/" className="hover:text-white">
              Beranda
            </Link>
            <ChevronRight size={14} />
            <Link href="/informasi-publik" className="hover:text-white">
              Informasi Publik
            </Link>
            <ChevronRight size={14} />
            <span className="text-white">Berita Terkini</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Newspaper size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Berita Terkini</h1>
              <p className="text-primary-lighter">
                Informasi terbaru seputar pemerintahan dan pembangunan daerah
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="border-border bg-card border-b py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} />
            <h2 className="text-lg font-bold text-foreground">Berita Utama</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredNews.map((article) => (
              <Link
                key={article.id}
                href={`/informasi-publik/berita-terkini/${article.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-slate-900"
              >
                <div className="aspect-[16/9] w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  <div className="from-primary to-primary-hover absolute inset-0 flex items-center justify-center bg-gradient-to-br">
                    <Newspaper className="h-16 w-16 text-white/30" />
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 left-0 p-6">
                  <span className="bg-info-light text-info mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold">
                    {article.category}
                  </span>
                  <h3 className="group-hover:text-primary-lighter mb-2 text-xl font-bold text-white transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="border-border bg-card border-b py-4">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <p className="text-muted-foreground mb-4 text-sm">
                Menampilkan {filteredNews.length} berita
              </p>
              <div className="space-y-6">
                {filteredNews.map((article) => (
                  <Link
                    key={article.id}
                    href={`/informasi-publik/berita-terkini/${article.slug}`}
                    className="group hover:border-primary/30 border-border bg-card flex gap-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="from-primary-lighter to-primary-light relative h-32 w-48 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br">
                      <div className="flex h-full w-full items-center justify-center">
                        <Newspaper className="text-primary/60 h-10 w-10" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="bg-info-light text-info rounded px-2 py-0.5 text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {article.date}
                        </span>
                      </div>
                      <h3 className="group-hover:text-primary mb-2 line-clamp-2 font-bold text-foreground transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {article.excerpt}
                      </p>
                      <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination - Simple placeholder */}
              <div className="mt-8 flex justify-center gap-2">
                <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium">
                  1
                </button>
                <button className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80">
                  2
                </button>
                <button className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80">
                  3
                </button>
                <button className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Popular Articles */}
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <h3 className="text-foreground mb-4 flex items-center gap-2 font-bold">
                  <TrendingUp className="text-primary" size={18} />
                  Berita Populer
                </h3>
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <Link
                      key={article.id}
                      href={`/informasi-publik/berita-terkini/${article.slug}`}
                      className="group flex gap-3"
                    >
                      <span className="bg-primary-lighter text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="group-hover:text-primary line-clamp-2 text-sm font-medium text-foreground transition-colors">
                          {article.title}
                        </h4>
                        <span className="text-muted-foreground text-xs">
                          {article.date}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <h3 className="text-foreground mb-4 flex items-center gap-2 font-bold">
                  <Tag className="text-primary" size={18} />
                  Kategori
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <span>{cat}</span>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscribe */}
              <div className="from-primary to-primary-hover rounded-2xl bg-gradient-to-br p-6 text-white">
                <h3 className="mb-2 font-bold">Berlangganan Newsletter</h3>
                <p className="text-primary-lighter mb-4 text-sm">
                  Dapatkan berita terbaru langsung ke email Anda
                </p>
                <Input
                  type="email"
                  placeholder="Email Anda"
                  className="placeholder:text-primary-lighter mb-3 border-0 bg-white/20 text-white"
                />
                <button className="text-primary hover:bg-primary-lighter w-full rounded-lg bg-white py-2 text-sm font-semibold transition-colors">
                  Berlangganan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
