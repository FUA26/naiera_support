"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronRight,
  Download,
  Search,
  Filter,
  Eye,
  Calendar,
  FileText,
  BarChart3,
  Newspaper,
  Book,
  FileSpreadsheet,
  Presentation,
  ExternalLink,
  Grid3X3,
  List,
  Tag,
} from "lucide-react";

interface Publication {
  id: string;
  title: string;
  category: string;
  type: string;
  year: number;
  publishDate: string;
  description: string;
  cover?: string;
  fileSize: string;
  downloads: number;
  pages: number;
}

const publications: Publication[] = [
  {
    id: "1",
    title: "Kabupaten Dalam Angka 2024",
    category: "Statistik",
    type: "Buku",
    year: 2024,
    publishDate: "2024-03-15",
    description:
      "Data statistik lengkap kabupaten tahun 2024 meliputi demografi, ekonomi, dan sosial.",
    fileSize: "15.2 MB",
    downloads: 2340,
    pages: 245,
  },
  {
    id: "2",
    title: "Profil Kesehatan Daerah 2023",
    category: "Kesehatan",
    type: "Laporan",
    year: 2023,
    publishDate: "2023-09-20",
    description:
      "Capaian program kesehatan dan indikator kesehatan masyarakat.",
    fileSize: "8.5 MB",
    downloads: 1560,
    pages: 120,
  },
  {
    id: "3",
    title: "Indikator Kesejahteraan Rakyat 2024",
    category: "Statistik",
    type: "Buku",
    year: 2024,
    publishDate: "2024-01-10",
    description: "Indikator kemiskinan dan tingkat kesejahteraan masyarakat.",
    fileSize: "6.8 MB",
    downloads: 890,
    pages: 85,
  },
  {
    id: "4",
    title: "Laporan Kinerja Instansi Pemerintah 2023",
    category: "Pemerintahan",
    type: "Laporan",
    year: 2023,
    publishDate: "2023-12-28",
    description: "LAKIP dan capaian kinerja seluruh SKPD.",
    fileSize: "12.3 MB",
    downloads: 678,
    pages: 180,
  },
  {
    id: "5",
    title: "Buletin Statistik Bulanan Januari 2024",
    category: "Statistik",
    type: "Buletin",
    year: 2024,
    publishDate: "2024-02-05",
    description: "Data statistik bulanan ekonomi dan sosial.",
    fileSize: "3.2 MB",
    downloads: 456,
    pages: 32,
  },
  {
    id: "6",
    title: "Profil Pendidikan Daerah 2023",
    category: "Pendidikan",
    type: "Laporan",
    year: 2023,
    publishDate: "2023-10-15",
    description: "Data dan capaian sektor pendidikan daerah.",
    fileSize: "9.1 MB",
    downloads: 1230,
    pages: 95,
  },
  {
    id: "7",
    title: "RPJMD 2024-2029",
    category: "Perencanaan",
    type: "Dokumen",
    year: 2024,
    publishDate: "2024-01-02",
    description: "Rencana Pembangunan Jangka Menengah Daerah.",
    fileSize: "25.6 MB",
    downloads: 3450,
    pages: 320,
  },
  {
    id: "8",
    title: "Produk Domestik Regional Bruto 2023",
    category: "Ekonomi",
    type: "Buku",
    year: 2023,
    publishDate: "2023-11-20",
    description: "Data PDRB dan pertumbuhan ekonomi daerah.",
    fileSize: "7.4 MB",
    downloads: 780,
    pages: 68,
  },
];

const categories = [
  "Semua",
  "Statistik",
  "Kesehatan",
  "Pendidikan",
  "Pemerintahan",
  "Perencanaan",
  "Ekonomi",
];
const types = ["Semua", "Buku", "Laporan", "Buletin", "Dokumen"];
const years = ["Semua", "2024", "2023", "2022"];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Buku":
      return Book;
    case "Laporan":
      return FileText;
    case "Buletin":
      return Newspaper;
    case "Dokumen":
      return FileSpreadsheet;
    default:
      return BookOpen;
  }
};

export default function PublikasiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filteredPubs = publications.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "Semua" || p.category === selectedCategory;
    const matchesType = selectedType === "Semua" || p.type === selectedType;
    const matchesYear =
      selectedYear === "Semua" || p.year.toString() === selectedYear;
    return matchesSearch && matchesCat && matchesType && matchesYear;
  });

  const totalDownloads = publications.reduce((sum, p) => sum + p.downloads, 0);
  const totalPages = publications.reduce((sum, p) => sum + p.pages, 0);

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        {/* Hero */}
        <section className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="mb-4 flex items-center gap-2 text-purple-300">
              <Link href="/">Beranda</Link>
              <ChevronRight className="h-4 w-4" />
              <span>Publikasi</span>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-4">
                <BookOpen className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Publikasi</h1>
                <p className="text-purple-200">
                  Perpustakaan Digital & Dokumen Resmi
                </p>
              </div>
            </div>
            <p className="max-w-2xl text-purple-200">
              Akses publikasi resmi, laporan statistik, buku tahunan, dan
              dokumen perencanaan pembangunan daerah.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="relative z-10 container mx-auto -mt-8 px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                icon: BookOpen,
                label: "Total Publikasi",
                value: publications.length.toString(),
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Download,
                label: "Total Unduhan",
                value: totalDownloads.toLocaleString(),
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: FileText,
                label: "Total Halaman",
                value: totalPages.toLocaleString(),
                color: "from-primary to-emerald-600",
              },
              {
                icon: BarChart3,
                label: "Kategori",
                value: (categories.length - 1).toString(),
                color: "from-amber-500 to-amber-600",
              },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border bg-white p-5 shadow-lg">
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} mb-3 flex items-center justify-center`}
                >
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Search & Filter */}
        <section className="container mx-auto px-4 py-8">
          <div className="rounded-2xl border bg-white p-6 shadow-lg">
            <div className="mb-4 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari publikasi..."
                  className="h-12 pl-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <div className="flex gap-1 rounded-xl border p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {showFilters && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Kategori</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <Button
                        key={c}
                        variant={selectedCategory === c ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(c)}
                      >
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Jenis</p>
                  <div className="flex flex-wrap gap-2">
                    {types.map((t) => (
                      <Button
                        key={t}
                        variant={selectedType === t ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Tahun</p>
                  <div className="flex flex-wrap gap-2">
                    {years.map((y) => (
                      <Button
                        key={y}
                        variant={selectedYear === y ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedYear(y)}
                      >
                        {y}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Publications */}
        <section className="container mx-auto px-4 pb-16">
          <p className="mb-6 text-slate-600">
            Menampilkan{" "}
            <span className="font-semibold">{filteredPubs.length}</span>{" "}
            publikasi
          </p>

          {viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPubs.map((pub) => {
                const TypeIcon = getTypeIcon(pub.type);
                return (
                  <div
                    key={pub.id}
                    className="group overflow-hidden rounded-2xl border bg-white shadow-md transition-all hover:shadow-xl"
                  >
                    <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <TypeIcon className="h-20 w-20 text-slate-300" />
                      <Badge className="bg-primary absolute top-3 right-3">
                        {pub.type}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <Badge variant="outline" className="mb-2">
                        {pub.category}
                      </Badge>
                      <h3 className="group-hover:text-primary line-clamp-2 font-semibold text-slate-900 transition-colors">
                        {pub.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {pub.description}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {pub.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {pub.downloads}
                        </span>
                        <span>{pub.fileSize}</span>
                      </div>
                      <Button className="bg-primary hover:bg-primary-hover mt-4 w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Unduh PDF
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPubs.map((pub) => {
                const TypeIcon = getTypeIcon(pub.type);
                return (
                  <div
                    key={pub.id}
                    className="group flex items-center gap-6 rounded-2xl border bg-white p-6 shadow-md transition-all hover:shadow-xl"
                  >
                    <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
                      <TypeIcon className="h-12 w-12 text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className="bg-primary">{pub.type}</Badge>
                        <Badge variant="outline">{pub.category}</Badge>
                      </div>
                      <h3 className="group-hover:text-primary text-lg font-semibold transition-colors">
                        {pub.title}
                      </h3>
                      <p className="mt-1 text-slate-600">{pub.description}</p>
                      <div className="mt-3 flex items-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(pub.publishDate).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {pub.pages} halaman
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {pub.downloads} unduhan
                        </span>
                        <span>{pub.fileSize}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="bg-primary hover:bg-primary-hover">
                        <Download className="mr-2 h-4 w-4" />
                        Unduh
                      </Button>
                      <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Links */}
        <section className="bg-purple-900 py-12 text-white">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-center text-2xl font-bold">
              Sumber Data Lainnya
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  icon: BarChart3,
                  label: "BPS Daerah",
                  href: "https://bps.go.id",
                },
                { icon: BookOpen, label: "Perpustakaan", href: "#" },
                { icon: Presentation, label: "Infografis", href: "#" },
                {
                  icon: FileText,
                  label: "PPID",
                  href: "/informasi-publik/ppid",
                },
              ].map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  className="flex items-center gap-3 rounded-xl bg-purple-800 p-4 transition-colors hover:bg-purple-700"
                >
                  <div className="rounded-lg bg-purple-600/30 p-2">
                    <l.icon className="h-5 w-5 text-purple-300" />
                  </div>
                  <span>{l.label}</span>
                  {l.href.startsWith("http") && (
                    <ExternalLink className="ml-auto h-4 w-4 opacity-50" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
