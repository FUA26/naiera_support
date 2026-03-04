"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  FileText,
  Scale,
  Map,
  Image as ImageIcon,
  Search,
  ArrowRight,
  Clock,
  Eye,
  Download,
  ExternalLink,
  BookOpen,
  Megaphone,
  FileSearch,
  BarChart3,
  Building2,
  Users,
  Award,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface InfoItem {
  slug: string;
  icon: LucideIcon;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  badge?: string;
  stats?: string;
}

interface Category {
  name: string;
  slug: string;
  icon: LucideIcon;
  color: string;
}

const categories: Category[] = [
  {
    name: "Berita & Pengumuman",
    slug: "news",
    icon: Newspaper,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "Agenda & Kegiatan",
    slug: "agenda",
    icon: Calendar,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    name: "Transparansi",
    slug: "transparency",
    icon: BarChart3,
    color: "text-primary",
  },
  {
    name: "Regulasi & Peraturan",
    slug: "regulations",
    icon: Scale,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    name: "Pariwisata",
    slug: "tourism",
    icon: Map,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  {
    name: "Galeri & Media",
    slug: "gallery",
    icon: ImageIcon,
    color: "text-pink-600 dark:text-pink-400",
  },
  {
    name: "PPID",
    slug: "ppid",
    icon: FileSearch,
    color: "text-teal-600 dark:text-teal-400",
  },
  {
    name: "Publikasi",
    slug: "publication",
    icon: BookOpen,
    color: "text-indigo-600 dark:text-indigo-400",
  },
];

const infoItems: InfoItem[] = [
  // Berita & Pengumuman
  {
    slug: "berita-terkini",
    icon: Newspaper,
    name: "Berita Terkini",
    description:
      "Berita dan informasi terbaru seputar pemerintahan dan pembangunan daerah",
    category: "Berita & Pengumuman",
    categorySlug: "news",
    badge: "Update",
    stats: "125 artikel",
  },
  {
    slug: "pengumuman",
    icon: Megaphone,
    name: "Pengumuman Resmi",
    description: "Pengumuman resmi dari pemerintah kabupaten",
    category: "Berita & Pengumuman",
    categorySlug: "news",
    stats: "48 pengumuman",
  },
  {
    slug: "siaran-pers",
    icon: FileText,
    name: "Siaran Pers",
    description: "Press release dan siaran pers resmi",
    category: "Berita & Pengumuman",
    categorySlug: "news",
    stats: "32 siaran",
  },

  // Agenda & Kegiatan
  {
    slug: "agenda-kegiatan",
    icon: Calendar,
    name: "Agenda Kegiatan",
    description: "Jadwal kegiatan dan acara pemerintah daerah",
    category: "Agenda & Kegiatan",
    categorySlug: "agenda",
    badge: "Terbaru",
    stats: "24 agenda",
  },
  {
    slug: "kalender-event",
    icon: Calendar,
    name: "Kalender Event",
    description: "Kalender event dan kegiatan publik sepanjang tahun",
    category: "Agenda & Kegiatan",
    categorySlug: "agenda",
    stats: "56 event",
  },
  {
    slug: "jadwal-pelayanan",
    icon: Clock,
    name: "Jadwal Pelayanan",
    description: "Jadwal operasional kantor dan pelayanan publik",
    category: "Agenda & Kegiatan",
    categorySlug: "agenda",
    stats: "15 lokasi",
  },

  // Transparansi
  {
    slug: "apbd",
    icon: BarChart3,
    name: "APBD & Keuangan",
    description: "Informasi Anggaran Pendapatan dan Belanja Daerah",
    category: "Transparansi",
    categorySlug: "transparency",
    badge: "Populer",
    stats: "2024-2025",
  },
  {
    slug: "laporan-kinerja",
    icon: Award,
    name: "Laporan Kinerja",
    description: "LAKIP dan laporan kinerja instansi pemerintah",
    category: "Transparansi",
    categorySlug: "transparency",
    stats: "12 laporan",
  },
  {
    slug: "dana-desa",
    icon: Building2,
    name: "Dana Desa",
    description: "Transparansi alokasi dan penggunaan dana desa",
    category: "Transparansi",
    categorySlug: "transparency",
    stats: "87 desa",
  },
  {
    slug: "pengadaan-barang",
    icon: FileText,
    name: "Pengadaan Barang/Jasa",
    description: "Informasi tender dan pengadaan barang/jasa",
    category: "Transparansi",
    categorySlug: "transparency",
    stats: "156 paket",
  },

  // Regulasi & Peraturan
  {
    slug: "peraturan-daerah",
    icon: Scale,
    name: "Peraturan Daerah",
    description: "Perda dan peraturan daerah yang berlaku",
    category: "Regulasi & Peraturan",
    categorySlug: "regulations",
    badge: "Lengkap",
    stats: "89 perda",
  },
  {
    slug: "peraturan-bupati",
    icon: FileText,
    name: "Peraturan Bupati",
    description: "Perbup dan keputusan bupati",
    category: "Regulasi & Peraturan",
    categorySlug: "regulations",
    stats: "234 perbup",
  },
  {
    slug: "standar-pelayanan",
    icon: BookOpen,
    name: "Standar Pelayanan",
    description: "SOP dan standar pelayanan publik",
    category: "Regulasi & Peraturan",
    categorySlug: "regulations",
    stats: "45 SOP",
  },

  // Pariwisata
  {
    slug: "destinasi-wisata",
    icon: Map,
    name: "Destinasi Wisata",
    description: "Panduan lengkap tempat wisata di kabupaten",
    category: "Pariwisata",
    categorySlug: "tourism",
    badge: "Populer",
    stats: "42 destinasi",
  },
  {
    slug: "event-wisata",
    icon: Calendar,
    name: "Event Wisata",
    description: "Festival dan event wisata sepanjang tahun",
    category: "Pariwisata",
    categorySlug: "tourism",
    stats: "18 event",
  },
  {
    slug: "kuliner-oleh-oleh",
    icon: Award,
    name: "Kuliner & Oleh-oleh",
    description: "Rekomendasi kuliner dan oleh-oleh khas daerah",
    category: "Pariwisata",
    categorySlug: "tourism",
    stats: "75 tempat",
  },
  {
    slug: "akomodasi",
    icon: Building2,
    name: "Akomodasi",
    description: "Daftar hotel, homestay, dan penginapan",
    category: "Pariwisata",
    categorySlug: "tourism",
    stats: "120+ pilihan",
  },

  // Galeri & Media
  {
    slug: "galeri-foto",
    icon: ImageIcon,
    name: "Galeri Foto",
    description: "Dokumentasi foto kegiatan dan pembangunan",
    category: "Galeri & Media",
    categorySlug: "gallery",
    stats: "2.5k foto",
  },
  {
    slug: "galeri-video",
    icon: Globe,
    name: "Galeri Video",
    description: "Video dokumenter dan liputan kegiatan",
    category: "Galeri & Media",
    categorySlug: "gallery",
    stats: "180 video",
  },
  {
    slug: "infografis",
    icon: BarChart3,
    name: "Infografis",
    description: "Infografis informasi dan data daerah",
    category: "Galeri & Media",
    categorySlug: "gallery",
    badge: "Baru",
    stats: "95 infografis",
  },

  // PPID
  {
    slug: "ppid",
    icon: FileSearch,
    name: "Layanan PPID",
    description: "Pejabat Pengelola Informasi dan Dokumentasi",
    category: "PPID",
    categorySlug: "ppid",
    stats: "24/7 Online",
  },
  {
    slug: "permohonan-informasi",
    icon: FileText,
    name: "Permohonan Informasi",
    description: "Ajukan permohonan informasi publik",
    category: "PPID",
    categorySlug: "ppid",
    badge: "Interaktif",
    stats: "850+ permohonan",
  },
  {
    slug: "daftar-informasi-publik",
    icon: BookOpen,
    name: "Daftar Informasi Publik",
    description: "Daftar informasi yang dapat diakses publik",
    category: "PPID",
    categorySlug: "ppid",
    stats: "456 dokumen",
  },

  // Publikasi
  {
    slug: "laporan-tahunan",
    icon: FileText,
    name: "Laporan Tahunan",
    description: "Laporan tahunan kinerja pemerintah daerah",
    category: "Publikasi",
    categorySlug: "publication",
    stats: "2019-2024",
  },
  {
    slug: "statistik-daerah",
    icon: BarChart3,
    name: "Statistik Daerah",
    description: "Data statistik dan indikator pembangunan",
    category: "Publikasi",
    categorySlug: "publication",
    stats: "Real-time",
  },
  {
    slug: "buku-profil",
    icon: BookOpen,
    name: "Buku Profil Daerah",
    description: "Profil lengkap kabupaten dalam bentuk buku digital",
    category: "Publikasi",
    categorySlug: "publication",
    stats: "5 edisi",
  },
];

export default function InformasiPublikPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = infoItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null || item.categorySlug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <main className="bg-muted">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16 text-white">
          <div className="container mx-auto max-w-6xl px-4">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-blue-100">
              <Link href="/" className="hover:text-white">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-white">Informasi Publik</span>
            </nav>

            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              Portal Informasi Publik
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-blue-50">
              Akses berbagai informasi publik, berita terkini, regulasi, dan
              data transparansi pemerintah Kabupaten Naiera.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari informasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-xl border-0 bg-white pl-12 text-slate-800 shadow-lg placeholder:text-slate-400"
              />
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { icon: Newspaper, label: "Berita", value: "125+" },
                { icon: FileText, label: "Dokumen", value: "500+" },
                { icon: Calendar, label: "Event", value: "80+" },
                { icon: Eye, label: "Pengunjung", value: "50k+" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <Icon className="mb-2 h-6 w-6" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-blue-100">{stat.label}</div>
                  </div>
                );
              })}
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
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      selectedCategory === cat.slug
                        ? "bg-blue-600 text-white shadow-md"
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

        {/* Content Grid */}
        <section className="py-12">
          <div className="container mx-auto max-w-6xl px-4">
            {/* Results Count */}
            <p className="text-muted-foreground mb-6 text-sm">
              Menampilkan {filteredItems.length} informasi
              {selectedCategory &&
                ` dalam kategori "${categories.find((c) => c.slug === selectedCategory)?.name}"`}
              {searchQuery && ` untuk "${searchQuery}"`}
            </p>

            {filteredItems.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.slug}
                      href={`/informasi-publik/${item.slug}`}
                      className="group border-border bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:hover:border-blue-800"
                    >
                      {/* Badge */}
                      {item.badge && (
                        <div className="absolute top-4 right-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.badge === "Update"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : item.badge === "Baru"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : item.badge === "Populer"
                                    ? "bg-primary-light text-primary-hover"
                                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            }`}
                          >
                            {item.badge}
                          </span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400">
                        <Icon size={28} />
                      </div>

                      {/* Content */}
                      <h3 className="text-foreground mb-2 text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {item.name}
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {item.description}
                      </p>

                      {/* Category & Stats */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          {item.category}
                        </span>
                        {item.stats && (
                          <span className="text-xs font-medium text-blue-600">
                            {item.stats}
                          </span>
                        )}
                      </div>

                      {/* Hover Action */}
                      <div className="absolute right-6 bottom-6 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                        <ArrowRight size={16} />
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
                  Informasi tidak ditemukan
                </h3>
                <p className="text-muted-foreground">
                  Coba ubah kata kunci pencarian atau pilih kategori lain.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="border-border bg-card border-t py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-foreground mb-8 text-center text-2xl font-bold">
              Akses Cepat
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  icon: Download,
                  title: "Download Dokumen",
                  desc: "Unduh peraturan dan dokumen publik",
                  href: "/informasi-publik/peraturan-daerah",
                  color: "bg-primary-lighter text-primary",
                },
                {
                  icon: FileSearch,
                  title: "Permohonan PPID",
                  desc: "Ajukan permohonan informasi",
                  href: "/informasi-publik/permohonan-informasi",
                  color:
                    "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                },
                {
                  icon: BarChart3,
                  title: "Data Transparansi",
                  desc: "Lihat data APBD dan keuangan",
                  href: "/informasi-publik/apbd",
                  color:
                    "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                },
                {
                  icon: ExternalLink,
                  title: "Link Terkait",
                  desc: "Akses website terkait",
                  href: "#",
                  color:
                    "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="border-border flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-blue-200 hover:shadow-md dark:hover:border-blue-800"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${item.color}`}
                    >
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
