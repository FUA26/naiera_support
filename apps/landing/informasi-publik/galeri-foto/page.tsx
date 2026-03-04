"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  ChevronRight,
  Search,
  Filter,
  Grid3X3,
  LayoutGrid,
  X,
  ChevronLeft,
  Download,
  Share2,
  Heart,
  Calendar,
  Camera,
  Eye,
  ZoomIn,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Photo {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  views: number;
  likes: number;
  color: string;
}

const photoCategories = [
  "Semua",
  "Kegiatan Bupati",
  "Pembangunan",
  "Festival & Event",
  "Budaya",
  "Pariwisata",
  "Pendidikan",
  "Kesehatan",
];

const photos: Photo[] = [
  {
    id: "1",
    title: "Peresmian Jembatan Harapan",
    description: "Bupati Naiera meresmikan jembatan penghubung dua kecamatan",
    category: "Pembangunan",
    date: "10 Januari 2026",
    views: 1250,
    likes: 89,
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "2",
    title: "Festival Budaya Naiera 2025",
    description: "Puncak Festival Budaya dengan parade seni tradisional",
    category: "Festival & Event",
    date: "15 Desember 2025",
    views: 3500,
    likes: 256,
    color: "from-purple-400 to-purple-600",
  },
  {
    id: "3",
    title: "Kunjungan ke UMKM Batik",
    description: "Bupati mengunjungi sentra UMKM batik khas Naiera",
    category: "Kegiatan Bupati",
    date: "8 Januari 2026",
    views: 890,
    likes: 67,
    color: "from-amber-400 to-amber-600",
  },
  {
    id: "4",
    title: "Air Terjun Pelangi",
    description: "Destinasi wisata alam Air Terjun Pelangi yang menawan",
    category: "Pariwisata",
    date: "5 Januari 2026",
    views: 2100,
    likes: 178,
    color: "from-primary to-emerald-600",
  },
  {
    id: "5",
    title: "Vaksinasi Massal di Puskesmas",
    description: "Program vaksinasi gratis untuk masyarakat",
    category: "Kesehatan",
    date: "3 Januari 2026",
    views: 650,
    likes: 45,
    color: "from-rose-400 to-rose-600",
  },
  {
    id: "6",
    title: "Wisuda Siswa Berprestasi",
    description: "Apresiasi kepada siswa berprestasi tingkat kabupaten",
    category: "Pendidikan",
    date: "28 Desember 2025",
    views: 980,
    likes: 112,
    color: "from-cyan-400 to-cyan-600",
  },
  {
    id: "7",
    title: "Tari Tradisional Naiera",
    description: "Penampilan tari tradisional dalam acara resmi",
    category: "Budaya",
    date: "20 Desember 2025",
    views: 1500,
    likes: 134,
    color: "from-pink-400 to-pink-600",
  },
  {
    id: "8",
    title: "Pembangunan Rumah Sakit Baru",
    description: "Progress pembangunan RSUD tipe B",
    category: "Pembangunan",
    date: "18 Desember 2025",
    views: 780,
    likes: 56,
    color: "from-indigo-400 to-indigo-600",
  },
  {
    id: "9",
    title: "Pantai Pasir Putih",
    description: "Keindahan Pantai Pasir Putih saat sunset",
    category: "Pariwisata",
    date: "15 Desember 2025",
    views: 2800,
    likes: 234,
    color: "from-orange-400 to-orange-600",
  },
  {
    id: "10",
    title: "Rapat Koordinasi FORKOPIMDA",
    description: "Rapat koordinasi Forum Komunikasi Pimpinan Daerah",
    category: "Kegiatan Bupati",
    date: "12 Desember 2025",
    views: 450,
    likes: 23,
    color: "from-slate-400 to-slate-600",
  },
  {
    id: "11",
    title: "Karnaval HUT RI",
    description: "Kemeriahan karnaval peringatan HUT Kemerdekaan RI",
    category: "Festival & Event",
    date: "17 Agustus 2025",
    views: 4200,
    likes: 312,
    color: "from-red-400 to-red-600",
  },
  {
    id: "12",
    title: "Sekolah Ramah Anak",
    description: "Launching program sekolah ramah anak",
    category: "Pendidikan",
    date: "10 Desember 2025",
    views: 560,
    likes: 41,
    color: "from-teal-400 to-teal-600",
  },
];

export default function GaleriFotoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch =
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || photo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    document.body.style.overflow = "auto";
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.id === selectedPhoto.id
    );
    let newIndex;
    if (direction === "prev") {
      newIndex =
        currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1;
    } else {
      newIndex =
        currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0;
    }
    setSelectedPhoto(filteredPhotos[newIndex] ?? null);
  };

  return (
    <>
      <main className="bg-slate-50">
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
              <span className="text-white">Galeri Foto</span>
            </nav>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Camera size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Galeri Foto</h1>
                <p className="text-primary-lighter">
                  Dokumentasi kegiatan dan momen penting Kabupaten Naiera
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} />
                <span>{photos.length} Foto</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={18} />
                <span>
                  {photos.reduce((sum, p) => sum + p.views, 0).toLocaleString()}{" "}
                  Views
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={18} />
                <span>
                  {photos.reduce((sum, p) => sum + p.likes, 0).toLocaleString()}{" "}
                  Likes
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-slate-200 bg-white py-4">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari foto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {photoCategories.slice(0, 5).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <button className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200">
                    <Filter size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg p-2 transition-all ${
                      viewMode === "grid"
                        ? "bg-primary-lighter text-primary"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("masonry")}
                    className={`rounded-lg p-2 transition-all ${
                      viewMode === "masonry"
                        ? "bg-primary-lighter text-primary"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <p className="mb-6 text-sm text-slate-600">
              Menampilkan {filteredPhotos.length} foto
              {selectedCategory !== "Semua" &&
                ` dalam kategori "${selectedCategory}"`}
            </p>

            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-3"
              }`}
            >
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`group relative cursor-pointer overflow-hidden rounded-xl ${
                    viewMode === "masonry" && index % 3 === 0
                      ? "row-span-2"
                      : ""
                  }`}
                  onClick={() => openLightbox(photo)}
                >
                  <div
                    className={`${
                      viewMode === "masonry" && index % 3 === 0
                        ? "aspect-[3/4]"
                        : "aspect-square"
                    } w-full bg-gradient-to-br ${photo.color}`}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-white/30" />
                    </div>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="mb-1 inline-block w-fit rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {photo.category}
                    </span>
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">
                      {photo.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-white/80">
                      <span className="flex items-center gap-1">
                        <Eye size={10} />
                        {photo.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={10} />
                        {photo.likes}
                      </span>
                    </div>
                  </div>

                  {/* Zoom Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 flex justify-center">
              <button className="bg-primary hover:bg-primary-hover rounded-xl px-8 py-3 font-semibold text-white transition-colors">
                Muat Lebih Banyak
              </button>
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X size={24} />
            </button>

            {/* Navigation */}
            <button
              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("prev");
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("next");
              }}
            >
              <ChevronRight size={24} />
            </button>

            {/* Image */}
            <div
              className="max-h-[80vh] max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`aspect-video w-full rounded-xl bg-gradient-to-br ${selectedPhoto.color}`}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-24 w-24 text-white/30" />
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 text-white">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  {selectedPhoto.category}
                </span>
                <h2 className="mt-2 text-xl font-bold">
                  {selectedPhoto.title}
                </h2>
                <p className="mt-1 text-white/70">
                  {selectedPhoto.description}
                </p>
                <div className="mt-4 flex items-center gap-6 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {selectedPhoto.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {selectedPhoto.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={14} />
                    {selectedPhoto.likes.toLocaleString()} likes
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20">
                    <Download size={16} />
                    Download
                  </button>
                  <button className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20">
                    <Share2 size={16} />
                    Bagikan
                  </button>
                  <button className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20">
                    <Heart size={16} />
                    Suka
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
