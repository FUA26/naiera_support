import Link from "next/link";
import { FileQuestion, ArrowLeft, Home, Calendar } from "lucide-react";
import { TopBar } from "@/components/landing/layout/top-bar";
import { Header } from "@/components/landing/layout/landing-header";
import { Footer } from "@/components/landing/layout/landing-footer";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Header />
      <main className="bg-muted flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-card mx-auto max-w-2xl rounded-2xl border p-12 text-center shadow-sm">
            <div className="bg-muted mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
              <FileQuestion className="text-muted-foreground" size={48} />
            </div>

            <h1 className="text-foreground mb-4 text-3xl font-bold">
              Agenda Tidak Ditemukan
            </h1>

            <p className="text-muted-foreground mb-8 text-lg">
              Maaf, agenda yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/informasi-publik/agenda-kegiatan"
                className="text-primary hover:text-primary-hover inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-6 py-3 font-semibold transition-colors"
              >
                <ArrowLeft size={20} />
                Kembali ke Agenda
              </Link>
              <Link
                href="/informasi-publik/agenda-kegiatan"
                className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors"
              >
                <Calendar size={20} />
                Lihat Semua Agenda
              </Link>
              <Link
                href="/"
                className="bg-card text-foreground hover:bg-muted inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-colors"
              >
                <Home size={20} />
                Halaman Utama
              </Link>
            </div>

            <div className="border-border mt-8 border-t pt-8">
              <p className="text-muted-foreground mb-4 text-sm">
                Mungkin Anda tertarik dengan:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  href="/informasi-publik/agenda-kegiatan"
                  className="text-primary hover:text-primary-hover rounded-lg bg-primary-lighter px-4 py-2 text-sm font-medium transition-colors"
                >
                  Semua Agenda
                </Link>
                <Link
                  href="/informasi-publik/berita-terkini"
                  className="text-primary hover:text-primary-hover rounded-lg bg-primary-lighter px-4 py-2 text-sm font-medium transition-colors"
                >
                  Berita Terkini
                </Link>
                <Link
                  href="/informasi-publik"
                  className="text-primary hover:text-primary-hover rounded-lg bg-primary-lighter px-4 py-2 text-sm font-medium transition-colors"
                >
                  Informasi Publik
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
