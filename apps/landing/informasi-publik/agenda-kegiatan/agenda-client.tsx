"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  Search,
  Tag,
  MapPin,
  Users,
  Globe,
  Building2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";
import type { Event } from "@/lib/events-data";

interface AgendaKegiatanClientProps {
  allEvents: Event[];
  categories: string[];
}

export function AgendaKegiatanClient({
  allEvents,
  categories,
}: AgendaKegiatanClientProps) {
  const t = useTranslations("Events");
  const locale = useLocale();
  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedType, setSelectedType] = useState("Semua");

  // Add "Semua" to categories
  const allCategories = ["Semua", ...categories];
  const statusOptions = ["Semua", "upcoming", "ongoing", "completed"];
  const typeOptions = ["Semua", "online", "offline", "hybrid"];

  // Filter events based on search, category, status, and type
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description &&
          event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Semua" || event.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "Semua" || event.status === selectedStatus;
      const matchesType = selectedType === "Semua" || event.type === selectedType;
      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }, [allEvents, searchQuery, selectedCategory, selectedStatus, selectedType]);

  // Get upcoming events count
  const upcomingCount = allEvents.filter((e) => e.status === "upcoming").length;

  // Format date
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(dateLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "online":
        return <Globe size={16} />;
      case "offline":
        return <Building2 size={16} />;
      case "hybrid":
        return <Users size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg px-3 py-1 text-xs font-semibold">
            Akan Datang
          </span>
        );
      case "ongoing":
        return (
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg px-3 py-1 text-xs font-semibold">
            Sedang Berlangsung
          </span>
        );
      case "completed":
        return (
          <span className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 rounded-lg px-3 py-1 text-xs font-semibold">
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

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
            <span className="text-white">Agenda Kegiatan</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Calendar size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Agenda Kegiatan</h1>
              <p className="text-primary-lighter">
                Jadwal kegiatan dan acara pemerintah daerah
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <Calendar className="mb-2 h-6 w-6" />
              <div className="text-2xl font-bold">{allEvents.length}</div>
              <div className="text-primary-lighter text-sm">Total Acara</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <Clock className="mb-2 h-6 w-6" />
              <div className="text-2xl font-bold">{upcomingCount}</div>
              <div className="text-primary-lighter text-sm">Akan Datang</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <MapPin className="mb-2 h-6 w-6" />
              <div className="text-2xl font-bold">
                {new Set(allEvents.map((e) => e.location)).size}
              </div>
              <div className="text-primary-lighter text-sm">Lokasi</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <Tag className="mb-2 h-6 w-6" />
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-primary-lighter text-sm">Kategori</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="border-border bg-card border-b py-4">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <h3 className="text-foreground font-semibold">Filter Agenda</h3>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari agenda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border-border bg-background rounded-lg px-3 py-2 text-sm"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "Semua" ? "Semua Kategori" : cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border-border bg-background rounded-lg px-3 py-2 text-sm"
              >
                <option value="Semua">Semua Status</option>
                <option value="upcoming">Akan Datang</option>
                <option value="ongoing">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border-border bg-background rounded-lg px-3 py-2 text-sm"
              >
                <option value="Semua">Semua Tipe</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="text-muted-foreground mb-6 text-sm">
            Menampilkan {filteredEvents.length} agenda
            {(selectedCategory !== "Semua" ||
              selectedStatus !== "Semua" ||
              selectedType !== "Semua" ||
              searchQuery) && (
              <span>
                {" "}
                dari filter yang dipilih
                {selectedCategory !== "Semua" && ` - Kategori: ${selectedCategory}`}
                {selectedStatus !== "Semua" && ` - Status: ${selectedStatus}`}
                {selectedType !== "Semua" && ` - Tipe: ${selectedType}`}
              </span>
            )}
          </p>

          {filteredEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/informasi-publik/agenda-kegiatan/${event.slug}`}
                  className="group hover:border-primary/30 border-border bg-card rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <span className="bg-info-light text-info rounded-lg px-3 py-1 text-xs font-semibold">
                      {event.category}
                    </span>
                    {getStatusBadge(event.status)}
                  </div>

                  {/* Title */}
                  <h3 className="group-hover:text-primary text-foreground mb-3 text-xl font-bold transition-colors">
                    {event.title}
                  </h3>

                  {/* Description */}
                  {event.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                      {event.description}
                    </p>
                  )}

                  {/* Event Details */}
                  <div className="text-muted-foreground space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(event.type)}
                      <span className="capitalize">{event.type}</span>
                    </div>
                    {event.attendees && (
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{event.attendees} peserta</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
                    <span className="text-muted-foreground text-xs">
                      {event.organizer}
                    </span>
                    <div className="text-primary flex items-center gap-1 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                      Lihat Detail
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-border bg-card py-16 text-center rounded-2xl border">
              <Calendar
                size={64}
                className="text-muted-foreground/50 mx-auto mb-4"
              />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Agenda Tidak Ditemukan
              </h3>
              <p className="text-muted-foreground mb-6">
                Tidak ada agenda yang sesuai dengan filter yang Anda pilih.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Semua");
                  setSelectedStatus("Semua");
                  setSelectedType("Semua");
                }}
                className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-6 py-2 font-medium transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
