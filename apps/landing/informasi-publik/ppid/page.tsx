"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileSearch,
  ChevronRight,
  Send,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  Download,
  Shield,
  Building2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Info,
  HelpCircle,
  FileCheck,
  Search,
} from "lucide-react";

interface RequestInfo {
  id: string;
  type: string;
  title: string;
  status: "tersedia" | "dikecualikan" | "berkala";
  description: string;
  downloadUrl?: string;
}

const publicInfo: RequestInfo[] = [
  {
    id: "1",
    type: "Berkala",
    title: "Laporan Keuangan Tahunan",
    status: "berkala",
    description: "Laporan keuangan yang dipublikasikan setiap tahun",
    downloadUrl: "#",
  },
  {
    id: "2",
    type: "Berkala",
    title: "Laporan Kinerja Instansi Pemerintah (LAKIP)",
    status: "berkala",
    description: "Capaian kinerja tahunan instansi",
    downloadUrl: "#",
  },
  {
    id: "3",
    type: "Berkala",
    title: "Profil dan Struktur Organisasi",
    status: "berkala",
    description: "Informasi profil organisasi",
    downloadUrl: "#",
  },
  {
    id: "4",
    type: "Serta Merta",
    title: "Pengumuman Bencana",
    status: "tersedia",
    description: "Informasi darurat terkait bencana",
  },
  {
    id: "5",
    type: "Setiap Saat",
    title: "Standar Operasional Prosedur",
    status: "tersedia",
    description: "SOP pelayanan publik",
    downloadUrl: "#",
  },
  {
    id: "6",
    type: "Dikecualikan",
    title: "Data Pribadi Pegawai",
    status: "dikecualikan",
    description: "Informasi yang dikecualikan sesuai UU",
  },
];

const stats = [
  {
    icon: FileText,
    label: "Total Permohonan",
    value: "1,247",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: CheckCircle2,
    label: "Diselesaikan",
    value: "1,189",
    color: "from-primary to-emerald-600",
  },
  {
    icon: Clock,
    label: "Dalam Proses",
    value: "58",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: Users,
    label: "Pemohon Terdaftar",
    value: "856",
    color: "from-purple-500 to-purple-600",
  },
];

export default function PPIDPage() {
  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    email: "",
    telepon: "",
    alamat: "",
    pekerjaan: "",
    informasi: "",
    alasan: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "form" | "track">("info");

  const filteredInfo = publicInfo.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Permohonan informasi berhasil dikirim! Nomor tiket: PPID-2024-" +
        Math.floor(Math.random() * 10000)
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero */}
        <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-20 text-white">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative container mx-auto px-4">
            <div className="mb-4 flex items-center gap-2 text-blue-300">
              <Link href="/">Beranda</Link>
              <ChevronRight className="h-4 w-4" />
              <span>PPID</span>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4">
                <FileSearch className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">PPID</h1>
                <p className="text-blue-200">
                  Pejabat Pengelola Informasi dan Dokumentasi
                </p>
              </div>
            </div>
            <p className="max-w-2xl text-blue-200">
              Layanan keterbukaan informasi publik sesuai UU No. 14 Tahun 2008
              tentang Keterbukaan Informasi Publik.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="relative z-10 container mx-auto -mt-8 px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => (
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

        {/* Tabs */}
        <section className="container mx-auto px-4 py-8">
          <div className="mb-6 flex gap-2">
            {[
              { id: "info", label: "Daftar Informasi", icon: FileText },
              { id: "form", label: "Ajukan Permohonan", icon: Send },
              { id: "track", label: "Lacak Permohonan", icon: Search },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Info List */}
          {activeTab === "info" && (
            <div className="rounded-2xl border bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari informasi publik..."
                    className="h-12 pl-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                {filteredInfo.map((info) => (
                  <div
                    key={info.id}
                    className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-xl p-3 ${info.status === "berkala" ? "bg-blue-100 text-blue-600" : info.status === "tersedia" ? "bg-primary-light text-primary" : "bg-red-100 text-red-600"}`}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{info.title}</h3>
                          <Badge variant="outline">{info.type}</Badge>
                          <Badge
                            className={
                              info.status === "berkala"
                                ? "bg-blue-100 text-blue-700"
                                : info.status === "tersedia"
                                  ? "bg-primary-light text-primary-hover"
                                  : "bg-red-100 text-red-700"
                            }
                          >
                            {info.status === "berkala"
                              ? "Berkala"
                              : info.status === "tersedia"
                                ? "Tersedia"
                                : "Dikecualikan"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {info.description}
                        </p>
                      </div>
                    </div>
                    {info.downloadUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Unduh
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Form */}
          {activeTab === "form" && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="rounded-2xl border bg-white p-6 shadow-lg">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
                    <Send className="h-5 w-5 text-blue-600" />
                    Formulir Permohonan Informasi
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Nama Lengkap *</Label>
                        <Input
                          required
                          value={formData.nama}
                          onChange={(e) =>
                            setFormData({ ...formData, nama: e.target.value })
                          }
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                      <div>
                        <Label>NIK *</Label>
                        <Input
                          required
                          value={formData.nik}
                          onChange={(e) =>
                            setFormData({ ...formData, nik: e.target.value })
                          }
                          placeholder="16 digit NIK"
                        />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="email@contoh.com"
                        />
                      </div>
                      <div>
                        <Label>Telepon *</Label>
                        <Input
                          required
                          value={formData.telepon}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              telepon: e.target.value,
                            })
                          }
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Alamat *</Label>
                      <Textarea
                        required
                        value={formData.alamat}
                        onChange={(e) =>
                          setFormData({ ...formData, alamat: e.target.value })
                        }
                        placeholder="Alamat lengkap"
                      />
                    </div>
                    <div>
                      <Label>Pekerjaan *</Label>
                      <Input
                        required
                        value={formData.pekerjaan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pekerjaan: e.target.value,
                          })
                        }
                        placeholder="Pekerjaan Anda"
                      />
                    </div>
                    <div>
                      <Label>Informasi yang Diminta *</Label>
                      <Textarea
                        required
                        className="min-h-[120px]"
                        value={formData.informasi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            informasi: e.target.value,
                          })
                        }
                        placeholder="Jelaskan informasi yang Anda minta"
                      />
                    </div>
                    <div>
                      <Label>Alasan Permohonan *</Label>
                      <Textarea
                        required
                        value={formData.alasan}
                        onChange={(e) =>
                          setFormData({ ...formData, alasan: e.target.value })
                        }
                        placeholder="Tujuan penggunaan informasi"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover h-12 w-full"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Kirim Permohonan
                    </Button>
                  </form>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                    <Info className="h-5 w-5" />
                    Informasi Penting
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Respon dalam 10 hari kerja</li>
                    <li>• Dapat diperpanjang 7 hari kerja</li>
                    <li>• Gratis atau biaya reproduksi</li>
                  </ul>
                </div>
                <div className="rounded-xl border bg-white p-4 shadow-lg">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Kontak PPID
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      Jl. Merdeka No. 1
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      (0251) 123456
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      ppid@contoh.go.id
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      Senin-Jumat, 08.00-16.00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Track Request */}
          {activeTab === "track" && (
            <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-lg">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
                <Search className="h-5 w-5 text-blue-600" />
                Lacak Status Permohonan
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Nomor Tiket Permohonan</Label>
                  <Input placeholder="PPID-2024-XXXX" />
                </div>
                <div>
                  <Label>Email Pemohon</Label>
                  <Input type="email" placeholder="email@contoh.com" />
                </div>
                <Button className="bg-primary hover:bg-primary-hover w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Lacak Status
                </Button>
              </div>
              <div className="mt-8 rounded-xl bg-slate-50 p-4">
                <p className="text-center text-sm text-slate-500">
                  Masukkan nomor tiket dan email untuk melihat status permohonan
                  Anda.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="bg-blue-900 py-12 text-white">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-center text-2xl font-bold">
              Tautan Penting
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  icon: Shield,
                  label: "Komisi Informasi",
                  href: "https://komisiinformasi.go.id",
                },
                { icon: FileCheck, label: "UU KIP", href: "#" },
                { icon: HelpCircle, label: "FAQ", href: "#" },
                {
                  icon: FileText,
                  label: "Regulasi",
                  href: "/informasi-publik/peraturan-daerah",
                },
              ].map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  className="flex items-center gap-3 rounded-xl bg-blue-800 p-4 transition-colors hover:bg-blue-700"
                >
                  <div className="rounded-lg bg-blue-600/30 p-2">
                    <l.icon className="h-5 w-5 text-blue-300" />
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
  );
}
