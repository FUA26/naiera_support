"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  FileCheck,
  FileText,
  GraduationCap,
  HeartPulse,
  IdCard,
  MessageCircle,
  Bus,
  Home,
  Building2,
  Users,
  Briefcase,
  ArrowRight,
  Landmark,
  TreePine,
  MapPin,
  ShieldAlert,
  Palmtree,
  Award,
  Factory,
  Heart,
  Sprout,
  FileSearch,
  Building,
  Cloud,
  Search,
  Link as LinkIcon,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ServiceCategory, ServiceWithCategory } from "@/lib/services-data";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Users,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Palmtree,
  Building2,
  Heart,
  TreePine,
  Landmark,
  FileSearch,
  ShieldAlert,
  IdCard,
  FileText,
  FileCheck,
  Home,
  MessageCircle,
  Bus,
  MapPin,
  Award,
  Factory,
  Sprout,
  Building,
  Cloud,
  CreditCard,
};

interface LayananPageClientProps {
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    slug: string;
  }>;
  services: Array<{
    slug: string;
    icon: string;
    name: string;
    description: string;
    categoryId: string;
    badge?: string;
    stats?: string;
    isIntegrated?: boolean;
    category: {
      id: string;
      name: string;
      icon: string;
      color: string;
      bgColor: string;
      slug: string;
    };
  }>;
}

export function LayananPageClient({
  categories: rawCategories,
  services: rawServices,
}: LayananPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [integrationFilter, setIntegrationFilter] = useState<'all' | 'integrated' | 'non-integrated'>('all');

  // Transform categories with icon components
  const categories = rawCategories.map((cat) => ({
    ...cat,
    icon: iconMap[cat.icon] || Users,
  }));

  // Transform services with icon components
  const services = rawServices.map((service) => ({
    ...service,
    icon: iconMap[service.icon] || FileText,
    category: {
      ...service.category,
      icon: iconMap[service.category.icon] || Users,
    },
  }));

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null ||
      service.category.slug === selectedCategory;
    const matchesIntegration =
      integrationFilter === 'all' ||
      (integrationFilter === 'integrated' && service.isIntegrated === true) ||
      (integrationFilter === 'non-integrated' && service.isIntegrated === false);
    return matchesSearch && matchesCategory && matchesIntegration;
  });

  return (
    <>
      <main className="bg-muted">
        {/* Hero Section */}
        <section className="from-primary to-primary-hover bg-gradient-to-br py-16 text-white">
          <div className="container mx-auto max-w-6xl px-4">
            {/* Breadcrumb */}
            <nav className="text-primary-light mb-6 flex items-center gap-2 text-sm">
              <Link href="/" className="hover:text-white">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-white">Layanan</span>
            </nav>

            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              Portal Layanan Publik
            </h1>
            <p className="text-primary-lighter mb-8 max-w-2xl text-lg">
              Temukan dan akses berbagai layanan publik yang tersedia untuk
              Anda. Pilih kategori atau cari layanan yang Anda butuhkan.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-xl border-0 bg-white pl-12 text-slate-800 shadow-lg placeholder:text-slate-400"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-border bg-card border-b py-6">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Semua Layanan
              </button>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      selectedCategory === cat.slug
                        ? "bg-primary text-white shadow-md"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Integration Filter */}
        <section className="border-border bg-muted border-b py-4">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-muted-foreground text-sm font-medium">
                Status Integrasi:
              </span>
              <button
                onClick={() => setIntegrationFilter('all')}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  integrationFilter === 'all'
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setIntegrationFilter('integrated')}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  integrationFilter === 'integrated'
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LinkIcon size={12} />
                Terintegrasi
              </button>
              <button
                onClick={() => setIntegrationFilter('non-integrated')}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  integrationFilter === 'non-integrated'
                    ? "bg-slate-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ExternalLink size={12} />
                Eksternal
              </button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="container mx-auto max-w-6xl px-4">
            {/* Results Count */}
            <p className="text-muted-foreground mb-6 text-sm">
              Menampilkan {filteredServices.length} layanan
              {selectedCategory &&
                ` dalam kategori "${
                  categories.find((c) => c.slug === selectedCategory)?.name
                }"`}
              {searchQuery && ` untuk "${searchQuery}"`}
            </p>

            {filteredServices.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.slug}
                      href={`/layanan/${service.slug}`}
                      className="group hover:border-primary/30 border-border bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Badges */}
                      <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                        {service.badge && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              service.badge === "Baru"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : service.badge === "Penting"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-primary-light text-primary-hover"
                            }`}
                          >
                            {service.badge}
                          </span>
                        )}
                        {service.isIntegrated !== undefined && (
                          <Badge
                            className={`text-xs font-medium ${
                              service.isIntegrated
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {service.isIntegrated ? (
                              <>
                                <LinkIcon className="mr-1" size={10} />
                                Terintegrasi
                              </>
                            ) : (
                              <>
                                <ExternalLink className="mr-1" size={10} />
                                Eksternal
                              </>
                            )}
                          </Badge>
                        )}
                      </div>

                      {/* Icon */}
                      <div className="bg-primary-lighter text-primary group-hover:bg-primary mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all group-hover:text-white">
                        <Icon size={28} />
                      </div>

                      {/* Content */}
                      <h3 className="group-hover:text-primary text-foreground mb-2 text-lg font-bold">
                        {service.name}
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {service.description}
                      </p>

                      {/* Category & Action */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          {service.category.name}
                        </span>
                        <div className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                          Lihat Detail
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Search className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  Layanan tidak ditemukan
                </h3>
                <p className="text-muted-foreground">
                  Coba ubah kata kunci pencarian atau pilih kategori lain.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
