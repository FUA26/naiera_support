"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Map,
  ChevronRight,
  Search,
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Heart,
  Navigation,
  Filter,
  Grid3X3,
  List,
  Camera,
  Utensils,
  Tent,
  Trees,
  Building2,
  Waves,
  Mountain,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Destination {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  openHours: string;
  facilities: string[];
  color: string;
  featured?: boolean;
}

const destinationCategories = [
  { name: "Semua", icon: Grid3X3 },
  { name: "Wisata Alam", icon: Trees },
  { name: "Pantai", icon: Waves },
  { name: "Gunung", icon: Mountain },
  { name: "Budaya", icon: Building2 },
  { name: "Kuliner", icon: Utensils },
  { name: "Camping", icon: Tent },
];

const destinations: Destination[] = [
  {
    id: "1",
    name: "Air Terjun Pelangi",
    description:
      "Air terjun setinggi 50 meter dengan pemandangan pelangi alami saat pagi hari",
    category: "Wisata Alam",
    location: "Kecamatan Lembah Hijau",
    rating: 4.8,
    reviews: 1250,
    price: "Rp 15.000",
    openHours: "07:00 - 17:00",
    facilities: ["Parkir", "Toilet", "Warung Makan", "Gazebo"],
    color: "from-primary to-teal-600",
    featured: true,
  },
  {
    id: "2",
    name: "Pantai Pasir Putih",
    description: "Pantai dengan pasir putih bersih dan sunset yang memukau",
    category: "Pantai",
    location: "Kecamatan Pesisir",
    rating: 4.7,
    reviews: 2100,
    price: "Rp 10.000",
    openHours: "24 Jam",
    facilities: ["Parkir", "Toilet", "Penginapan", "Restoran", "Water Sport"],
    color: "from-cyan-400 to-blue-600",
    featured: true,
  },
  {
    id: "3",
    name: "Gunung Harapan",
    description: "Pendakian dengan pemandangan sunrise spektakuler di puncak",
    category: "Gunung",
    location: "Kecamatan Tinggi",
    rating: 4.9,
    reviews: 890,
    price: "Rp 25.000",
    openHours: "05:00 - 18:00",
    facilities: ["Pos Pendakian", "Camping Ground", "Shelter"],
    color: "from-amber-400 to-orange-600",
    featured: true,
  },
  {
    id: "4",
    name: "Desa Wisata Budaya",
    description:
      "Pengalaman budaya lokal dengan atraksi tari dan kerajinan tradisional",
    category: "Budaya",
    location: "Kecamatan Tradisi",
    rating: 4.6,
    reviews: 567,
    price: "Rp 20.000",
    openHours: "08:00 - 16:00",
    facilities: ["Parkir", "Galeri", "Workshop", "Homestay"],
    color: "from-purple-400 to-pink-600",
  },
  {
    id: "5",
    name: "Hutan Pinus Sejuk",
    description:
      "Area hutan pinus dengan spot foto instagramable dan udara sejuk",
    category: "Wisata Alam",
    location: "Kecamatan Bukit",
    rating: 4.5,
    reviews: 1890,
    price: "Rp 12.000",
    openHours: "06:00 - 18:00",
    facilities: ["Parkir", "Toilet", "Kafe", "Spot Foto"],
    color: "from-green-400 to-emerald-600",
  },
  {
    id: "6",
    name: "Pantai Karang Indah",
    description: "Pantai dengan formasi karang unik dan spot snorkeling",
    category: "Pantai",
    location: "Kecamatan Pesisir Timur",
    rating: 4.4,
    reviews: 678,
    price: "Rp 15.000",
    openHours: "07:00 - 18:00",
    facilities: ["Parkir", "Toilet", "Penyewaan Alat Snorkeling"],
    color: "from-blue-400 to-indigo-600",
  },
  {
    id: "7",
    name: "Kampung Kuliner Naiera",
    description: "Pusat kuliner dengan berbagai makanan khas daerah",
    category: "Kuliner",
    location: "Kecamatan Kota",
    rating: 4.7,
    reviews: 3200,
    price: "Gratis",
    openHours: "10:00 - 22:00",
    facilities: ["Parkir", "Toilet", "50+ Warung"],
    color: "from-red-400 to-rose-600",
  },
  {
    id: "8",
    name: "Bukit Camping Bintang",
    description:
      "Lokasi camping dengan pemandangan langit berbintang yang jernih",
    category: "Camping",
    location: "Kecamatan Bukit",
    rating: 4.8,
    reviews: 450,
    price: "Rp 35.000",
    openHours: "24 Jam",
    facilities: ["Parkir", "Toilet", "Sewa Tenda", "Api Unggun"],
    color: "from-indigo-400 to-purple-600",
  },
  {
    id: "9",
    name: "Museum Sejarah Naiera",
    description: "Museum yang menyimpan artefak dan sejarah Kabupaten Naiera",
    category: "Budaya",
    location: "Kecamatan Kota",
    rating: 4.3,
    reviews: 320,
    price: "Rp 5.000",
    openHours: "09:00 - 16:00",
    facilities: ["Parkir", "Toilet", "Guide", "Toko Souvenir"],
    color: "from-slate-400 to-gray-600",
  },
];

export default function DestinasiWisataPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const featuredDestinations = destinations.filter((d) => d.featured);
  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || dest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              <span className="text-white">Destinasi Wisata</span>
            </nav>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Map size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Destinasi Wisata Naiera</h1>
                <p className="text-primary-lighter">
                  Jelajahi keindahan alam dan budaya Kabupaten Naiera
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mt-6 flex max-w-xl gap-3">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari destinasi wisata..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border-0 bg-white pl-12 text-slate-800 shadow-lg"
                />
              </div>
              <button className="flex h-12 items-center gap-2 rounded-lg bg-white/10 px-4 text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                <Navigation size={18} />
                Lihat Peta
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{destinations.length} Destinasi</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={18} />
                <span>Rating Rata-rata 4.6</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera size={18} />
                <span>500+ Foto</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Destinations */}
        <section className="border-b border-slate-200 bg-white py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
              <Star className="text-amber-500" size={20} />
              Destinasi Unggulan
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredDestinations.map((dest) => (
                <Link
                  key={dest.id}
                  href={`/informasi-publik/destinasi/${dest.id}`}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  <div
                    className={`aspect-[4/3] w-full bg-gradient-to-br ${dest.color}`}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <Camera className="h-16 w-16 text-white/30" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute right-0 bottom-0 left-0 p-4">
                    <span className="mb-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {dest.category}
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {dest.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-white/80">
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400" />
                        {dest.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {dest.location}
                      </span>
                    </div>
                  </div>
                  <button className="absolute top-3 right-3 rounded-full bg-white/20 p-2 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
                    <Heart size={18} />
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-slate-200 bg-white py-4">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {destinationCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        selectedCategory === cat.name
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Icon size={16} />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
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
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-2 transition-all ${
                    viewMode === "list"
                      ? "bg-primary-lighter text-primary"
                      : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations Grid/List */}
        <section className="py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <p className="mb-6 text-sm text-slate-600">
              Menampilkan {filteredDestinations.length} destinasi
              {selectedCategory !== "Semua" &&
                ` dalam kategori "${selectedCategory}"`}
            </p>

            {viewMode === "grid" ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDestinations.map((dest) => (
                  <Link
                    key={dest.id}
                    href={`/informasi-publik/destinasi/${dest.id}`}
                    className="group hover:border-primary-light overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg"
                  >
                    <div
                      className={`aspect-video w-full bg-gradient-to-br ${dest.color}`}
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <Camera className="h-12 w-12 text-white/30" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="bg-primary-lighter text-primary-hover rounded-full px-2 py-0.5 text-xs font-medium">
                          {dest.category}
                        </span>
                        <div className="flex items-center gap-1 text-sm">
                          <Star size={14} className="text-amber-500" />
                          <span className="font-medium text-slate-700">
                            {dest.rating}
                          </span>
                          <span className="text-slate-400">
                            ({dest.reviews})
                          </span>
                        </div>
                      </div>
                      <h3 className="group-hover:text-primary mb-1 font-bold text-slate-800">
                        {dest.name}
                      </h3>
                      <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                        {dest.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin size={14} />
                          {dest.location}
                        </span>
                        <span className="text-primary font-semibold">
                          {dest.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDestinations.map((dest) => (
                  <Link
                    key={dest.id}
                    href={`/informasi-publik/destinasi/${dest.id}`}
                    className="group hover:border-primary-light flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-lg"
                  >
                    <div
                      className={`aspect-video w-48 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${dest.color}`}
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <Camera className="h-10 w-10 text-white/30" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="bg-primary-lighter text-primary-hover rounded-full px-2 py-0.5 text-xs font-medium">
                          {dest.category}
                        </span>
                        <div className="flex items-center gap-1 text-sm">
                          <Star size={14} className="text-amber-500" />
                          <span className="font-medium text-slate-700">
                            {dest.rating}
                          </span>
                          <span className="text-slate-400">
                            ({dest.reviews} ulasan)
                          </span>
                        </div>
                      </div>
                      <h3 className="group-hover:text-primary mb-1 text-lg font-bold text-slate-800">
                        {dest.name}
                      </h3>
                      <p className="mb-3 text-sm text-slate-600">
                        {dest.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {dest.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {dest.openHours}
                        </span>
                        <span className="text-primary font-semibold">
                          {dest.price}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {dest.facilities.slice(0, 4).map((facility) => (
                          <span
                            key={facility}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {facility}
                          </span>
                        ))}
                        {dest.facilities.length > 4 && (
                          <span className="text-xs text-slate-400">
                            +{dest.facilities.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="from-primary to-primary-hover rounded-2xl bg-gradient-to-r p-8 text-white">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div>
                  <h3 className="mb-2 text-xl font-bold">
                    Rencanakan Perjalanan Anda
                  </h3>
                  <p className="text-primary-lighter">
                    Unduh panduan wisata lengkap atau hubungi Dinas Pariwisata
                    untuk informasi lebih lanjut
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="text-primary hover:bg-primary-lighter rounded-xl bg-white px-6 py-3 font-semibold transition-colors">
                    Unduh Panduan
                  </button>
                  <button className="rounded-xl border-2 border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
                    Hubungi Kami
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
