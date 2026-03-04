"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Search,
  Download,
  FileText,
  Calendar,
  Eye,
  ChevronRight,
  Filter,
  BookOpen,
  Gavel,
  Scroll,
  FileCheck,
  Building2,
  SortDesc,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface Regulation {
  id: string;
  number: string;
  year: number;
  title: string;
  category: string;
  type: string;
  status: "berlaku" | "dicabut" | "diubah";
  publishDate: string;
  effectiveDate: string;
  description: string;
  views: number;
  downloads: number;
}

const regulations: Regulation[] = [
  {
    id: "1",
    number: "01",
    year: 2024,
    title: "Peraturan Daerah tentang APBD Tahun 2024",
    category: "Keuangan",
    type: "Peraturan Daerah",
    status: "berlaku",
    publishDate: "2024-01-02",
    effectiveDate: "2024-01-01",
    description: "Mengatur APBD tahun 2024.",
    views: 1250,
    downloads: 456,
  },
  {
    id: "2",
    number: "02",
    year: 2024,
    title: "Peraturan Daerah tentang Retribusi Jasa Umum",
    category: "Retribusi",
    type: "Peraturan Daerah",
    status: "berlaku",
    publishDate: "2024-02-15",
    effectiveDate: "2024-03-01",
    description: "Mengatur retribusi jasa umum.",
    views: 890,
    downloads: 234,
  },
  {
    id: "3",
    number: "05",
    year: 2023,
    title: "Peraturan Bupati tentang Pengelolaan Keuangan Desa",
    category: "Keuangan",
    type: "Peraturan Bupati",
    status: "berlaku",
    publishDate: "2023-06-20",
    effectiveDate: "2023-07-01",
    description: "Pedoman pengelolaan keuangan desa.",
    views: 2100,
    downloads: 1890,
  },
  {
    id: "4",
    number: "12",
    year: 2023,
    title: "Peraturan Daerah tentang RTRW 2023-2043",
    category: "Tata Ruang",
    type: "Peraturan Daerah",
    status: "berlaku",
    publishDate: "2023-09-01",
    effectiveDate: "2023-10-01",
    description: "Rencana tata ruang wilayah.",
    views: 1560,
    downloads: 678,
  },
  {
    id: "5",
    number: "08",
    year: 2023,
    title: "Peraturan Daerah tentang Penyelenggaraan Pendidikan",
    category: "Pendidikan",
    type: "Peraturan Daerah",
    status: "berlaku",
    publishDate: "2023-07-15",
    effectiveDate: "2023-08-01",
    description: "Mengatur penyelenggaraan pendidikan.",
    views: 980,
    downloads: 345,
  },
  {
    id: "6",
    number: "03",
    year: 2022,
    title: "Peraturan Daerah tentang Pajak Daerah",
    category: "Perpajakan",
    type: "Peraturan Daerah",
    status: "diubah",
    publishDate: "2022-03-10",
    effectiveDate: "2022-04-01",
    description: "Jenis pajak daerah.",
    views: 3200,
    downloads: 1456,
  },
  {
    id: "7",
    number: "10",
    year: 2022,
    title: "Peraturan Bupati tentang Standar Pelayanan Minimal",
    category: "Pelayanan",
    type: "Peraturan Bupati",
    status: "berlaku",
    publishDate: "2022-08-20",
    effectiveDate: "2022-09-01",
    description: "SPM perangkat daerah.",
    views: 756,
    downloads: 234,
  },
  {
    id: "8",
    number: "06",
    year: 2021,
    title: "Peraturan Daerah tentang Pengelolaan Sampah",
    category: "Lingkungan",
    type: "Peraturan Daerah",
    status: "berlaku",
    publishDate: "2021-05-10",
    effectiveDate: "2021-06-01",
    description: "Pengelolaan sampah rumah tangga.",
    views: 1120,
    downloads: 456,
  },
];

const types = ["Semua", "Peraturan Daerah", "Peraturan Bupati"];
const years = ["Semua", "2024", "2023", "2022", "2021"];

export default function RegulasiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua");
  const [showFilters, setShowFilters] = useState(false);

  const filteredRegulations = regulations.filter((reg) => {
    const matchesSearch = reg.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "Semua" || reg.type === selectedType;
    const matchesYear =
      selectedYear === "Semua" || reg.year.toString() === selectedYear;
    return matchesSearch && matchesType && matchesYear;
  });

  const getStatusBadge = (status: string) => {
    const configs: Record<
      string,
      { bg: string; icon: typeof CheckCircle; label: string }
    > = {
      berlaku: {
        bg: "bg-primary-light text-primary-hover",
        icon: CheckCircle,
        label: "Berlaku",
      },
      diubah: {
        bg: "bg-amber-100 text-amber-700",
        icon: AlertCircle,
        label: "Diubah",
      },
      dicabut: {
        bg: "bg-red-100 text-red-700",
        icon: AlertCircle,
        label: "Dicabut",
      },
    };
    const config = configs[status];
    return config ? (
      <Badge className={config.bg}>
        <config.icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    ) : null;
  };

  return (
    <>
      <main className="to-primary-lighter/30 min-h-screen bg-gradient-to-br from-slate-50 via-white">
        <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="text-primary mb-4 flex items-center gap-2">
              <Link href="/">Beranda</Link>
              <ChevronRight className="h-4 w-4" />
              <span>Peraturan Daerah</span>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="from-primary rounded-2xl bg-gradient-to-br to-emerald-600 p-4">
                <Scale className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Peraturan Daerah</h1>
                <p className="text-slate-300">Produk Hukum Daerah</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 container mx-auto -mt-8 px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Scale, label: "Perda", value: "45" },
              { icon: Gavel, label: "Perbup", value: "128" },
              { icon: FileCheck, label: "Berlaku", value: "156" },
              { icon: Download, label: "Unduhan", value: "25.6K" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border bg-white p-5 shadow-lg">
                <div className="from-primary mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br to-emerald-600">
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari peraturan..."
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
            </div>
            {showFilters && (
              <div className="space-y-4 border-t pt-4">
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

        <section className="container mx-auto px-4 pb-16">
          <p className="mb-6 text-slate-600">
            Menampilkan{" "}
            <span className="font-semibold">{filteredRegulations.length}</span>{" "}
            peraturan
          </p>
          <div className="space-y-4">
            {filteredRegulations.map((reg) => (
              <div
                key={reg.id}
                className="group rounded-2xl border bg-white p-6 shadow-md transition-all hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-xl p-3 ${reg.type === "Peraturan Daerah" ? "bg-primary-light text-primary" : "bg-blue-100 text-blue-600"}`}
                  >
                    {reg.type === "Peraturan Daerah" ? (
                      <Scale className="h-5 w-5" />
                    ) : (
                      <Gavel className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">
                        {reg.type} No. {reg.number}/{reg.year}
                      </Badge>
                      {getStatusBadge(reg.status)}
                    </div>
                    <h3 className="group-hover:text-primary text-lg font-semibold transition-colors">
                      {reg.title}
                    </h3>
                    <p className="mt-2 text-slate-600">{reg.description}</p>
                    <div className="mt-4 flex items-center gap-6 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(reg.publishDate).toLocaleDateString("id-ID")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {reg.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {reg.downloads}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-primary hover:bg-primary-hover">
                      <Download className="mr-2 h-4 w-4" />
                      Unduh
                    </Button>
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Detail
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 py-12 text-white">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-center text-2xl font-bold">Akses Cepat</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  icon: BookOpen,
                  label: "JDIH Nasional",
                  href: "https://jdih.go.id",
                },
                { icon: Building2, label: "JDIH Provinsi", href: "#" },
                { icon: Scale, label: "Terbaru", href: "#" },
                { icon: FileText, label: "Statistik", href: "#" },
              ].map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  className="hover:border-primary-light hover:bg-primary-lighter flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-all"
                >
                  <div className="bg-primary/20 rounded-lg p-2">
                    <l.icon className="text-primary h-5 w-5" />
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
