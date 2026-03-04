"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
  Building2,
  ArrowLeft,
  Share2,
  Bookmark,
  Download,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ChevronRight,
  User,
  Ticket,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Event } from "@/lib/events-data";

interface AgendaDetailClientProps {
  event: Event;
  relatedEvents: Event[];
}

export function AgendaDetailClient({ event, relatedEvents }: AgendaDetailClientProps) {
  const t = useTranslations("Events");
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
    const title = encodeURIComponent(event.title);

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
  };

  const getStatusBadge = () => {
    switch (event.status) {
      case "upcoming":
        return (
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg px-4 py-2 text-sm font-semibold">
            Akan Datang
          </span>
        );
      case "ongoing":
        return (
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg px-4 py-2 text-sm font-semibold">
            Sedang Berlangsung
          </span>
        );
      case "completed":
        return (
          <span className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 rounded-lg px-4 py-2 text-sm font-semibold">
            Selesai
          </span>
        );
    }
  };

  const getTypeIcon = () => {
    switch (event.type) {
      case "online":
        return <Globe size={24} />;
      case "offline":
        return <Building2 size={24} />;
      case "hybrid":
        return <Users size={24} />;
      default:
        return <Calendar size={24} />;
    }
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
              href="/informasi-publik/agenda-kegiatan"
              className="hover:text-primary"
            >
              Agenda Kegiatan
            </Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">
              {event.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-background border-b">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="py-8">
            <Link
              href="/informasi-publik/agenda-kegiatan"
              className="text-muted-hover text-muted-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} />
              Kembali ke Agenda Kegiatan
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              {getStatusBadge()}
              <span className="bg-info-light text-info rounded-lg px-4 py-2 text-sm font-semibold">
                {event.category}
              </span>
              <span className="border-border flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                {getTypeIcon()}
                <span className="capitalize">{event.type}</span>
              </span>
            </div>

            <h1 className="text-foreground mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-sm md:text-base">
              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar size={18} />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Clock size={18} />
                <span>{event.time}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <MapPin size={18} />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Event Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured Image */}
              <div className="from-primary-light to-primary-lighter bg-gradient-to-br relative aspect-video w-full overflow-hidden rounded-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <Calendar size={80} className="mx-auto mb-4" />
                    <p className="text-xl font-semibold">{event.title}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <div className="flex flex-wrap gap-4">
                  {event.registrationRequired && (
                    <button className="bg-primary text-primary-foreground hover:bg-primary-hover flex-1 flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors">
                      <Ticket size={20} />
                      Daftar Sekarang
                    </button>
                  )}
                  <button
                    onClick={() => window.print()}
                    className="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-colors"
                  >
                    <Download size={20} />
                    Unduh Info
                  </button>
                  <button className="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-colors">
                    <Bookmark size={20} />
                  </button>
                  <button className="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>

                {/* Social Share */}
                <div className="border-border mt-4 flex items-center gap-3 border-t pt-4">
                  <span className="text-muted-foreground text-sm">Bagikan:</span>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="hover:bg-blue-50 hover:text-blue-600 text-muted-foreground rounded-lg p-2 transition-colors"
                  >
                    <Facebook size={18} />
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="hover:bg-sky-50 hover:text-sky-600 text-muted-foreground rounded-lg p-2 transition-colors"
                  >
                    <Twitter size={18} />
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="hover:bg-blue-50 hover:text-blue-700 text-muted-foreground rounded-lg p-2 transition-colors"
                  >
                    <Linkedin size={18} />
                  </button>
                  <button
                    onClick={copyLink}
                    className="hover:bg-gray-50 hover:text-gray-600 text-muted-foreground rounded-lg p-2 transition-colors"
                  >
                    <LinkIcon size={18} />
                  </button>
                </div>
              </div>

              {/* Event Description */}
              <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
                <h2 className="text-foreground mb-4 text-2xl font-bold">
                  Tentang Agenda
                </h2>
                {event.description ? (
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {event.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    Deskripsi lengkap mengenai agenda ini akan segera diperbarui.
                    Silakan hubungi penyelenggara untuk informasi lebih lanjut.
                  </p>
                )}

                <h3 className="text-foreground mb-3 mt-8 text-lg font-bold">
                  Informasi Penting
                </h3>
                <ul className="space-y-2">
                  <li className="text-muted-foreground flex items-start gap-2">
                    <ChevronRight size={18} className="text-primary mt-1 flex-shrink-0" />
                    <span>Peserta harap datang 15 menit sebelum acara dimulai</span>
                  </li>
                  <li className="text-muted-foreground flex items-start gap-2">
                    <ChevronRight size={18} className="text-primary mt-1 flex-shrink-0" />
                    <span>Membawa identitas yang sah untuk registrasi ulang</span>
                  </li>
                  <li className="text-muted-foreground flex items-start gap-2">
                    <ChevronRight size={18} className="text-primary mt-1 flex-shrink-0" />
                    <span>
                      {event.type === "online"
                        ? "Link meeting akan dikirimkan melalui email setelah registrasi"
                        : event.type === "hybrid"
                          ? "Bisa diikuti secara online atau offline sesuai pilihan"
                          : "Lokasi acara mudah diakses dengan transportasi umum"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Event Details */}
              <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Detail Acara
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
                        Tanggal
                      </h3>
                      <div className="text-foreground flex items-center gap-2 font-medium">
                        <Calendar size={20} className="text-primary" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
                        Waktu
                      </h3>
                      <div className="text-foreground flex items-center gap-2 font-medium">
                        <Clock size={20} className="text-primary" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
                        Lokasi
                      </h3>
                      <div className="text-foreground flex items-center gap-2 font-medium">
                        <MapPin size={20} className="text-primary" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
                        Tipe Acara
                      </h3>
                      <div className="text-foreground flex items-center gap-2 font-medium">
                        {getTypeIcon()}
                        <span className="capitalize">{event.type}</span>
                      </div>
                    </div>
                  </div>

                  {event.attendees && (
                    <div>
                      <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
                        Jumlah Peserta
                      </h3>
                      <div className="text-foreground flex items-center gap-2 font-medium">
                        <Users size={20} className="text-primary" />
                        <span>{event.attendees}</span>
                      </div>
                    </div>
                  )}

                  {event.maxAttendees && (
                    <div>
                      <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
                        Kapasitas
                      </h3>
                      <div className="text-foreground flex items-center gap-2 font-medium">
                        <Ticket size={20} className="text-primary" />
                        <span>
                          {event.maxAttendees === null
                            ? "Tidak terbatas"
                            : `${event.maxAttendees} peserta`}
                        </span>
                      </div>
                    </div>
                  )}

                  {event.registrationRequired && (
                    <div className="bg-info-light text-info rounded-lg p-4">
                      <p className="font-semibold">Registrasi Diperlukan</p>
                      <p className="text-sm opacity-80">
                        Silakan daftar untuk mengikuti agenda ini
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Organizer Card */}
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <h3 className="text-foreground mb-4 font-bold">Penyelenggara</h3>
                <div className="flex items-center gap-4">
                  <div className="bg-primary-lighter text-primary flex h-12 w-12 items-center justify-center rounded-full font-bold">
                    {event.organizer.charAt(0)}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      {event.organizer}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {event.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <h3 className="text-foreground mb-4 font-bold">Informasi Cepat</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-foreground font-medium">
                      {event.status === "upcoming"
                        ? "Akan Datang"
                        : event.status === "ongoing"
                          ? "Sedang Berlangsung"
                          : "Selesai"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kategori</span>
                    <span className="text-foreground font-medium">
                      {event.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipe</span>
                    <span className="text-foreground font-medium capitalize">
                      {event.type}
                    </span>
                  </div>
                  {event.registrationRequired && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registrasi</span>
                      <span className="text-foreground font-medium">
                        {event.maxAttendees
                          ? `Tersedia ${event.maxAttendees} slot`
                          : "Terbuka"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                  <h3 className="text-foreground mb-4 font-bold">
                    Agenda Terkait
                  </h3>
                  <div className="space-y-4">
                    {relatedEvents.map((relatedEvent) => (
                      <Link
                        key={relatedEvent.id}
                        href={`/informasi-publik/agenda-kegiatan/${relatedEvent.slug}`}
                        className="block group"
                      >
                        <div className="mb-2 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-primary-light to-primary-lighter">
                          <Calendar className="text-primary/60" size={32} />
                        </div>
                        <h4 className="group-hover:text-primary line-clamp-2 text-sm font-semibold text-foreground transition-colors">
                          {relatedEvent.title}
                        </h4>
                        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                          <Calendar size={12} />
                          <span>{formatDate(relatedEvent.date)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/informasi-publik/agenda-kegiatan"
                    className="text-primary hover:text-primary-hover mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                  >
                    Lihat Semua Agenda
                    <ChevronRight size={16} />
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
