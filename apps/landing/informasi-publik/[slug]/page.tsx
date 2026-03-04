import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  FileText,
  Scale,
  Map,
  Image as ImageIcon,
  Clock,
  Eye,
  Download,
  ExternalLink,
  BookOpen,
  Megaphone,
  FileSearch,
  BarChart3,
  Building2,
  Award,
  Globe,
  ArrowRight,
  ChevronRight,
  Share2,
  Bookmark,
  Printer,
  Users,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface InfoDetail {
  slug: string;
  icon: LucideIcon;
  name: string;
  description: string;
  fullDescription: string;
  category: string;
  categorySlug: string;
  badge?: string;
  stats?: string;
  lastUpdate?: string;
  content: ContentItem[];
  relatedInfo?: string[];
  downloads?: DownloadItem[];
  externalLinks?: ExternalLinkItem[];
  contactInfo?: ContactItem;
}

interface ContentItem {
  type: "text" | "list" | "table" | "highlight";
  title?: string;
  content: string | string[];
}

interface DownloadItem {
  name: string;
  format: string;
  size: string;
}

interface ExternalLinkItem {
  name: string;
  url: string;
  description: string;
}

interface ContactItem {
  office: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

const infoData: InfoDetail[] = [
  // Berita Terkini
  {
    slug: "berita-terkini",
    icon: Newspaper,
    name: "Berita Terkini",
    description:
      "Berita dan informasi terbaru seputar pemerintahan dan pembangunan daerah",
    fullDescription:
      "Portal berita resmi Pemerintah Kabupaten Naiera yang menyajikan informasi terkini seputar kegiatan pemerintahan, pembangunan daerah, dan berbagai program untuk masyarakat.",
    category: "Berita & Pengumuman",
    categorySlug: "news",
    badge: "Update",
    stats: "125 artikel",
    lastUpdate: "12 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Temukan berbagai berita terkini seputar perkembangan Kabupaten Naiera. Kami berkomitmen menyajikan informasi yang akurat, terpercaya, dan up-to-date untuk masyarakat.",
      },
      {
        type: "highlight",
        title: "Kategori Berita",
        content:
          "Pemerintahan, Pembangunan, Ekonomi, Sosial Budaya, Pendidikan, Kesehatan, Lingkungan, Olahraga",
      },
      {
        type: "list",
        title: "Fitur Portal Berita",
        content: [
          "Berita ter-update setiap hari",
          "Arsip berita lengkap sejak 2019",
          "Pencarian berita berdasarkan kategori dan tanggal",
          "Berlangganan newsletter via email",
          "Berbagi berita ke media sosial",
        ],
      },
    ],
    relatedInfo: ["pengumuman", "siaran-pers", "galeri-foto"],
    externalLinks: [
      {
        name: "Media Sosial Resmi",
        url: "#",
        description: "Ikuti update di Instagram dan Facebook",
      },
      {
        name: "YouTube Channel",
        url: "#",
        description: "Video berita dan dokumentasi",
      },
    ],
  },

  // Pengumuman
  {
    slug: "pengumuman",
    icon: Megaphone,
    name: "Pengumuman Resmi",
    description: "Pengumuman resmi dari pemerintah kabupaten",
    fullDescription:
      "Halaman pengumuman resmi yang memuat informasi penting dari seluruh perangkat daerah Kabupaten Naiera untuk diketahui masyarakat.",
    category: "Berita & Pengumuman",
    categorySlug: "news",
    stats: "48 pengumuman",
    lastUpdate: "11 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Pengumuman resmi dari Pemerintah Kabupaten Naiera mencakup informasi tentang lowongan kerja, hasil seleksi, perubahan kebijakan, dan informasi penting lainnya.",
      },
      {
        type: "list",
        title: "Jenis Pengumuman",
        content: [
          "Pengumuman CPNS/PPPK",
          "Hasil Seleksi dan Rekrutmen",
          "Perubahan Jadwal Pelayanan",
          "Himbauan dan Edaran",
          "Pengumuman Lelang/Tender",
          "Informasi Bantuan Sosial",
        ],
      },
    ],
    relatedInfo: ["berita-terkini", "siaran-pers"],
  },

  // Siaran Pers
  {
    slug: "siaran-pers",
    icon: FileText,
    name: "Siaran Pers",
    description: "Press release dan siaran pers resmi",
    fullDescription:
      "Kumpulan siaran pers resmi yang dikeluarkan oleh Bagian Humas Sekretariat Daerah Kabupaten Naiera untuk media massa.",
    category: "Berita & Pengumuman",
    categorySlug: "news",
    stats: "32 siaran",
    lastUpdate: "10 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Siaran pers resmi ini ditujukan untuk media massa dan masyarakat umum sebagai sumber informasi yang valid dan dapat dipertanggungjawabkan.",
      },
    ],
    relatedInfo: ["berita-terkini", "pengumuman"],
    contactInfo: {
      office: "Bagian Humas Sekretariat Daerah",
      address: "Jl. Pemerintahan No. 1, Naiera",
      phone: "(021) 1234-5678",
      email: "humas@naiera.go.id",
      hours: "Senin-Jumat, 08:00-16:00 WIB",
    },
  },

  // Agenda Kegiatan
  {
    slug: "agenda-kegiatan",
    icon: Calendar,
    name: "Agenda Kegiatan",
    description: "Jadwal kegiatan dan acara pemerintah daerah",
    fullDescription:
      "Informasi lengkap agenda kegiatan resmi Pemerintah Kabupaten Naiera termasuk kunjungan kerja, rapat koordinasi, dan acara seremonial.",
    category: "Agenda & Kegiatan",
    categorySlug: "agenda",
    badge: "Terbaru",
    stats: "24 agenda",
    lastUpdate: "12 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Pantau jadwal kegiatan resmi pemerintah daerah untuk mengetahui agenda-agenda penting yang akan dilaksanakan.",
      },
      {
        type: "list",
        title: "Jenis Kegiatan",
        content: [
          "Rapat Koordinasi Pimpinan Daerah",
          "Kunjungan Kerja Bupati/Wakil Bupati",
          "Upacara dan Seremoni",
          "Peluncuran Program",
          "Audiensi dan Penerimaan Tamu",
        ],
      },
    ],
    relatedInfo: ["kalender-event", "jadwal-pelayanan"],
  },

  // APBD
  {
    slug: "apbd",
    icon: BarChart3,
    name: "APBD & Keuangan",
    description: "Informasi Anggaran Pendapatan dan Belanja Daerah",
    fullDescription:
      "Transparansi pengelolaan keuangan daerah melalui publikasi APBD, realisasi anggaran, dan laporan keuangan pemerintah daerah.",
    category: "Transparansi",
    categorySlug: "transparency",
    badge: "Populer",
    stats: "2024-2025",
    lastUpdate: "1 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Pemerintah Kabupaten Naiera berkomitmen mewujudkan transparansi pengelolaan keuangan daerah sebagai bentuk akuntabilitas kepada masyarakat.",
      },
      {
        type: "highlight",
        title: "APBD 2025",
        content:
          "Total Anggaran: Rp 2,8 Triliun | Pendapatan: Rp 2,6 Triliun | Belanja: Rp 2,75 Triliun",
      },
      {
        type: "list",
        title: "Dokumen Tersedia",
        content: [
          "Perda APBD Tahun 2025",
          "Perda Perubahan APBD 2024",
          "Ringkasan APBD",
          "Realisasi Anggaran per Triwulan",
          "Laporan Realisasi Anggaran (LRA)",
          "Neraca Keuangan Daerah",
        ],
      },
    ],
    relatedInfo: ["laporan-kinerja", "dana-desa", "pengadaan-barang"],
    downloads: [
      { name: "Ringkasan APBD 2025", format: "PDF", size: "2.5 MB" },
      { name: "Perda APBD 2025", format: "PDF", size: "5.8 MB" },
      { name: "Realisasi Q4 2024", format: "Excel", size: "1.2 MB" },
    ],
  },

  // Peraturan Daerah
  {
    slug: "peraturan-daerah",
    icon: Scale,
    name: "Peraturan Daerah",
    description: "Perda dan peraturan daerah yang berlaku",
    fullDescription:
      "Database lengkap Peraturan Daerah (Perda) Kabupaten Naiera yang telah disahkan dan masih berlaku.",
    category: "Regulasi & Peraturan",
    categorySlug: "regulations",
    badge: "Lengkap",
    stats: "89 perda",
    lastUpdate: "5 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Akses seluruh Peraturan Daerah Kabupaten Naiera yang telah disahkan oleh DPRD dan Bupati. Dokumen tersedia dalam format PDF yang dapat diunduh.",
      },
      {
        type: "list",
        title: "Kategori Perda",
        content: [
          "Pajak dan Retribusi Daerah",
          "Tata Ruang dan Lingkungan",
          "Kesehatan dan Sosial",
          "Pendidikan dan Kebudayaan",
          "Ekonomi dan Pariwisata",
          "Kelembagaan dan Pemerintahan",
        ],
      },
    ],
    relatedInfo: ["peraturan-bupati", "standar-pelayanan"],
    downloads: [
      { name: "Daftar Perda Tahun 2024", format: "PDF", size: "450 KB" },
      { name: "Perda RTRW", format: "PDF", size: "15 MB" },
      { name: "Perda Pajak Daerah", format: "PDF", size: "3.2 MB" },
    ],
  },

  // Destinasi Wisata
  {
    slug: "destinasi-wisata",
    icon: Map,
    name: "Destinasi Wisata",
    description: "Panduan lengkap tempat wisata di kabupaten",
    fullDescription:
      "Jelajahi keindahan Kabupaten Naiera melalui berbagai destinasi wisata alam, budaya, dan kuliner yang menarik.",
    category: "Pariwisata",
    categorySlug: "tourism",
    badge: "Populer",
    stats: "42 destinasi",
    lastUpdate: "8 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Kabupaten Naiera memiliki beragam destinasi wisata yang memukau, mulai dari wisata alam pegunungan, pantai, air terjun, hingga wisata budaya dan sejarah.",
      },
      {
        type: "highlight",
        title: "Top Destinasi",
        content:
          "Air Terjun Naiera, Pantai Pasir Putih, Gunung Harapan, Desa Wisata Budaya, Taman Nasional Lestari",
      },
      {
        type: "list",
        title: "Kategori Wisata",
        content: [
          "Wisata Alam (15 destinasi)",
          "Wisata Pantai (8 destinasi)",
          "Wisata Budaya & Sejarah (10 destinasi)",
          "Wisata Kuliner (5 kawasan)",
          "Wisata Agro (4 lokasi)",
        ],
      },
    ],
    relatedInfo: ["event-wisata", "kuliner-oleh-oleh", "akomodasi"],
    externalLinks: [
      {
        name: "Peta Wisata Interaktif",
        url: "#",
        description: "Lihat lokasi semua destinasi",
      },
      {
        name: "Virtual Tour",
        url: "#",
        description: "Jelajahi destinasi secara virtual",
      },
    ],
  },

  // PPID
  {
    slug: "ppid",
    icon: FileSearch,
    name: "Layanan PPID",
    description: "Pejabat Pengelola Informasi dan Dokumentasi",
    fullDescription:
      "PPID (Pejabat Pengelola Informasi dan Dokumentasi) Kabupaten Naiera melayani permohonan informasi publik sesuai UU KIP No. 14 Tahun 2008.",
    category: "PPID",
    categorySlug: "ppid",
    stats: "24/7 Online",
    lastUpdate: "12 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "PPID Kabupaten Naiera berkomitmen memberikan pelayanan informasi publik yang cepat, tepat, dan berkualitas kepada seluruh pemohon informasi.",
      },
      {
        type: "highlight",
        title: "Standar Layanan",
        content:
          "Waktu Respon: 10 Hari Kerja | Perpanjangan: 7 Hari Kerja | Keberatan: 30 Hari Kerja",
      },
      {
        type: "list",
        title: "Jenis Informasi",
        content: [
          "Informasi Berkala (diumumkan secara rutin)",
          "Informasi Serta Merta (diumumkan tanpa penundaan)",
          "Informasi Tersedia Setiap Saat (dapat diakses kapan saja)",
          "Informasi Dikecualikan (tidak dapat diakses publik)",
        ],
      },
      {
        type: "list",
        title: "Cara Mengajukan Permohonan",
        content: [
          "Datang langsung ke kantor PPID",
          "Mengisi formulir online di website",
          "Mengirim email ke ppid@naiera.go.id",
          "Mengirim surat resmi ke alamat PPID",
        ],
      },
    ],
    relatedInfo: ["permohonan-informasi", "daftar-informasi-publik"],
    downloads: [
      { name: "Formulir Permohonan Informasi", format: "PDF", size: "150 KB" },
      { name: "Formulir Keberatan", format: "PDF", size: "120 KB" },
      { name: "SOP Layanan PPID", format: "PDF", size: "800 KB" },
    ],
    contactInfo: {
      office: "PPID Kabupaten Naiera",
      address: "Gedung Sekretariat Daerah Lt. 2, Jl. Pemerintahan No. 1",
      phone: "(021) 1234-5679",
      email: "ppid@naiera.go.id",
      hours: "Senin-Jumat, 08:00-15:00 WIB",
    },
  },

  // Permohonan Informasi
  {
    slug: "permohonan-informasi",
    icon: FileText,
    name: "Permohonan Informasi",
    description: "Ajukan permohonan informasi publik",
    fullDescription:
      "Layanan pengajuan permohonan informasi publik secara online sesuai dengan Undang-Undang Keterbukaan Informasi Publik.",
    category: "PPID",
    categorySlug: "ppid",
    badge: "Interaktif",
    stats: "850+ permohonan",
    lastUpdate: "12 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Ajukan permohonan informasi publik Anda melalui sistem online PPID. Kami akan memproses permohonan Anda sesuai dengan standar layanan yang berlaku.",
      },
      {
        type: "list",
        title: "Langkah Pengajuan",
        content: [
          "Isi formulir permohonan dengan lengkap",
          "Unggah identitas diri (KTP/SIM)",
          "Jelaskan informasi yang diminta dengan detail",
          "Submit permohonan dan catat nomor register",
          "Pantau status permohonan secara online",
          "Terima notifikasi via email/SMS",
        ],
      },
      {
        type: "list",
        title: "Persyaratan",
        content: [
          "Identitas pemohon (nama, alamat, nomor telepon, email)",
          "Fotokopi KTP/SIM/Paspor",
          "Informasi yang diminta secara jelas",
          "Alasan permohonan informasi",
        ],
      },
    ],
    relatedInfo: ["ppid", "daftar-informasi-publik"],
  },

  // Galeri Foto
  {
    slug: "galeri-foto",
    icon: ImageIcon,
    name: "Galeri Foto",
    description: "Dokumentasi foto kegiatan dan pembangunan",
    fullDescription:
      "Koleksi foto dokumentasi kegiatan pemerintahan, pembangunan, dan berbagai event di Kabupaten Naiera.",
    category: "Galeri & Media",
    categorySlug: "gallery",
    stats: "2.5k foto",
    lastUpdate: "12 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Jelajahi galeri foto yang mendokumentasikan berbagai kegiatan, pembangunan, dan momen penting di Kabupaten Naiera.",
      },
      {
        type: "list",
        title: "Kategori Album",
        content: [
          "Kegiatan Bupati dan Wakil Bupati",
          "Pembangunan Infrastruktur",
          "Program Pemberdayaan Masyarakat",
          "Event dan Festival",
          "Pariwisata dan Budaya",
          "Dokumentasi Sejarah",
        ],
      },
    ],
    relatedInfo: ["galeri-video", "infografis", "berita-terkini"],
  },

  // Statistik Daerah
  {
    slug: "statistik-daerah",
    icon: BarChart3,
    name: "Statistik Daerah",
    description: "Data statistik dan indikator pembangunan",
    fullDescription:
      "Portal data statistik Kabupaten Naiera yang menyajikan berbagai indikator pembangunan dan data demografi.",
    category: "Publikasi",
    categorySlug: "publication",
    stats: "Real-time",
    lastUpdate: "12 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Akses data statistik terkini Kabupaten Naiera untuk mendukung perencanaan, penelitian, dan pengambilan keputusan berbasis data.",
      },
      {
        type: "highlight",
        title: "Data Kunci 2025",
        content:
          "Populasi: 1.2 Juta | Luas: 2,500 km² | Kecamatan: 15 | Desa/Kelurahan: 180",
      },
      {
        type: "list",
        title: "Kategori Data",
        content: [
          "Data Demografi dan Kependudukan",
          "Statistik Ekonomi dan PDRB",
          "Indikator Kesehatan",
          "Data Pendidikan",
          "Statistik Pertanian",
          "Data Infrastruktur",
          "Indeks Pembangunan Manusia (IPM)",
        ],
      },
    ],
    relatedInfo: ["apbd", "laporan-tahunan", "buku-profil"],
    downloads: [
      { name: "Naiera Dalam Angka 2024", format: "PDF", size: "25 MB" },
      { name: "Statistik Daerah 2024", format: "PDF", size: "15 MB" },
      { name: "Data Terbuka (Open Data)", format: "Excel", size: "5 MB" },
    ],
    externalLinks: [
      {
        name: "BPS Kabupaten Naiera",
        url: "#",
        description: "Portal BPS resmi",
      },
      {
        name: "Satu Data Indonesia",
        url: "#",
        description: "Portal data nasional",
      },
    ],
  },

  // Kalender Event
  {
    slug: "kalender-event",
    icon: Calendar,
    name: "Kalender Event",
    description: "Kalender event dan kegiatan publik sepanjang tahun",
    fullDescription:
      "Jadwal lengkap event, festival, dan kegiatan publik yang diselenggarakan di Kabupaten Naiera sepanjang tahun.",
    category: "Agenda & Kegiatan",
    categorySlug: "agenda",
    stats: "56 event",
    lastUpdate: "10 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Temukan berbagai event menarik yang akan diselenggarakan di Kabupaten Naiera. Dari festival budaya hingga event olahraga dan kegiatan komunitas.",
      },
    ],
    relatedInfo: ["agenda-kegiatan", "event-wisata"],
  },

  // Jadwal Pelayanan
  {
    slug: "jadwal-pelayanan",
    icon: Clock,
    name: "Jadwal Pelayanan",
    description: "Jadwal operasional kantor dan pelayanan publik",
    fullDescription:
      "Informasi jadwal operasional seluruh kantor pelayanan publik di Kabupaten Naiera.",
    category: "Agenda & Kegiatan",
    categorySlug: "agenda",
    stats: "15 lokasi",
    lastUpdate: "1 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Ketahui jadwal operasional kantor pelayanan publik untuk memudahkan Anda dalam mengakses layanan.",
      },
      {
        type: "list",
        title: "Informasi Tersedia",
        content: [
          "Jadwal buka kantor kecamatan",
          "Jadwal pelayanan Disdukcapil",
          "Jadwal SAMSAT",
          "Jadwal Puskesmas",
          "Jadwal layanan khusus",
        ],
      },
    ],
    relatedInfo: ["agenda-kegiatan"],
  },

  // Laporan Kinerja
  {
    slug: "laporan-kinerja",
    icon: Award,
    name: "Laporan Kinerja",
    description: "LAKIP dan laporan kinerja instansi pemerintah",
    fullDescription:
      "Laporan Akuntabilitas Kinerja Instansi Pemerintah (LAKIP) dan laporan kinerja pemerintah daerah.",
    category: "Transparansi",
    categorySlug: "transparency",
    stats: "12 laporan",
    lastUpdate: "15 Februari 2025",
    content: [
      {
        type: "text",
        content:
          "LAKIP merupakan wujud akuntabilitas kinerja pemerintah daerah dalam mencapai sasaran strategis pembangunan.",
      },
    ],
    relatedInfo: ["apbd", "laporan-tahunan"],
    downloads: [
      { name: "LAKIP 2024", format: "PDF", size: "8 MB" },
      { name: "LAKIP 2023", format: "PDF", size: "7.5 MB" },
    ],
  },

  // Dana Desa
  {
    slug: "dana-desa",
    icon: Building2,
    name: "Dana Desa",
    description: "Transparansi alokasi dan penggunaan dana desa",
    fullDescription:
      "Portal transparansi dana desa yang menampilkan alokasi dan realisasi penggunaan dana desa di seluruh wilayah.",
    category: "Transparansi",
    categorySlug: "transparency",
    stats: "87 desa",
    lastUpdate: "5 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Pantau alokasi dan realisasi penggunaan dana desa di seluruh desa di Kabupaten Naiera secara transparan.",
      },
    ],
    relatedInfo: ["apbd", "pengadaan-barang"],
  },

  // Pengadaan Barang
  {
    slug: "pengadaan-barang",
    icon: FileText,
    name: "Pengadaan Barang/Jasa",
    description: "Informasi tender dan pengadaan barang/jasa",
    fullDescription:
      "Portal informasi pengadaan barang dan jasa pemerintah daerah yang transparan dan akuntabel.",
    category: "Transparansi",
    categorySlug: "transparency",
    stats: "156 paket",
    lastUpdate: "12 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Informasi pengadaan barang dan jasa pemerintah daerah melalui sistem e-procurement yang transparan.",
      },
    ],
    relatedInfo: ["apbd"],
    externalLinks: [
      {
        name: "LPSE Kabupaten Naiera",
        url: "#",
        description: "Portal e-procurement",
      },
      { name: "INAPROC", url: "#", description: "Portal pengadaan nasional" },
    ],
  },

  // Peraturan Bupati
  {
    slug: "peraturan-bupati",
    icon: FileText,
    name: "Peraturan Bupati",
    description: "Perbup dan keputusan bupati",
    fullDescription:
      "Database Peraturan Bupati (Perbup) dan Keputusan Bupati Kabupaten Naiera.",
    category: "Regulasi & Peraturan",
    categorySlug: "regulations",
    stats: "234 perbup",
    lastUpdate: "8 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Akses koleksi lengkap Peraturan Bupati dan Keputusan Bupati Kabupaten Naiera.",
      },
    ],
    relatedInfo: ["peraturan-daerah", "standar-pelayanan"],
  },

  // Standar Pelayanan
  {
    slug: "standar-pelayanan",
    icon: BookOpen,
    name: "Standar Pelayanan",
    description: "SOP dan standar pelayanan publik",
    fullDescription:
      "Standar Operasional Prosedur (SOP) dan standar pelayanan publik seluruh perangkat daerah.",
    category: "Regulasi & Peraturan",
    categorySlug: "regulations",
    stats: "45 SOP",
    lastUpdate: "1 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Ketahui standar pelayanan yang harus diberikan oleh setiap unit pelayanan publik.",
      },
    ],
    relatedInfo: ["peraturan-daerah", "peraturan-bupati"],
  },

  // Event Wisata
  {
    slug: "event-wisata",
    icon: Calendar,
    name: "Event Wisata",
    description: "Festival dan event wisata sepanjang tahun",
    fullDescription:
      "Kalender event wisata dan festival budaya yang diselenggarakan di Kabupaten Naiera.",
    category: "Pariwisata",
    categorySlug: "tourism",
    stats: "18 event",
    lastUpdate: "5 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Jangan lewatkan berbagai festival dan event wisata menarik di Kabupaten Naiera!",
      },
    ],
    relatedInfo: ["destinasi-wisata", "kalender-event"],
  },

  // Kuliner & Oleh-oleh
  {
    slug: "kuliner-oleh-oleh",
    icon: Award,
    name: "Kuliner & Oleh-oleh",
    description: "Rekomendasi kuliner dan oleh-oleh khas daerah",
    fullDescription:
      "Panduan kuliner dan oleh-oleh khas Kabupaten Naiera yang wajib dicoba.",
    category: "Pariwisata",
    categorySlug: "tourism",
    stats: "75 tempat",
    lastUpdate: "10 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Nikmati kekayaan kuliner dan bawa pulang oleh-oleh khas Kabupaten Naiera!",
      },
    ],
    relatedInfo: ["destinasi-wisata", "akomodasi"],
  },

  // Akomodasi
  {
    slug: "akomodasi",
    icon: Building2,
    name: "Akomodasi",
    description: "Daftar hotel, homestay, dan penginapan",
    fullDescription:
      "Daftar lengkap hotel, homestay, dan penginapan di Kabupaten Naiera.",
    category: "Pariwisata",
    categorySlug: "tourism",
    stats: "120+ pilihan",
    lastUpdate: "8 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Temukan akomodasi yang nyaman untuk menginap selama berkunjung ke Kabupaten Naiera.",
      },
    ],
    relatedInfo: ["destinasi-wisata", "kuliner-oleh-oleh"],
  },

  // Galeri Video
  {
    slug: "galeri-video",
    icon: Globe,
    name: "Galeri Video",
    description: "Video dokumenter dan liputan kegiatan",
    fullDescription:
      "Koleksi video dokumenter, liputan kegiatan, dan konten multimedia lainnya.",
    category: "Galeri & Media",
    categorySlug: "gallery",
    stats: "180 video",
    lastUpdate: "11 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Tonton berbagai video dokumenter dan liputan kegiatan Pemerintah Kabupaten Naiera.",
      },
    ],
    relatedInfo: ["galeri-foto", "berita-terkini"],
  },

  // Infografis
  {
    slug: "infografis",
    icon: BarChart3,
    name: "Infografis",
    description: "Infografis informasi dan data daerah",
    fullDescription:
      "Koleksi infografis yang menyajikan data dan informasi dalam format visual yang menarik.",
    category: "Galeri & Media",
    categorySlug: "gallery",
    badge: "Baru",
    stats: "95 infografis",
    lastUpdate: "12 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Pahami data dan informasi daerah melalui infografis yang informatif dan mudah dipahami.",
      },
    ],
    relatedInfo: ["galeri-foto", "statistik-daerah"],
  },

  // Daftar Informasi Publik
  {
    slug: "daftar-informasi-publik",
    icon: BookOpen,
    name: "Daftar Informasi Publik",
    description: "Daftar informasi yang dapat diakses publik",
    fullDescription:
      "Daftar Informasi Publik (DIP) yang tersedia dan dapat diakses oleh masyarakat.",
    category: "PPID",
    categorySlug: "ppid",
    stats: "456 dokumen",
    lastUpdate: "1 Januari 2026",
    content: [
      {
        type: "text",
        content:
          "Daftar Informasi Publik memuat seluruh informasi yang wajib disediakan dan diumumkan kepada publik.",
      },
    ],
    relatedInfo: ["ppid", "permohonan-informasi"],
    downloads: [
      { name: "DIP Tahun 2024", format: "PDF", size: "2 MB" },
      { name: "DIP Tahun 2023", format: "PDF", size: "1.8 MB" },
    ],
  },

  // Laporan Tahunan
  {
    slug: "laporan-tahunan",
    icon: FileText,
    name: "Laporan Tahunan",
    description: "Laporan tahunan kinerja pemerintah daerah",
    fullDescription:
      "Laporan tahunan penyelenggaraan pemerintahan daerah (LPPD) dan laporan pertanggungjawaban.",
    category: "Publikasi",
    categorySlug: "publication",
    stats: "2019-2024",
    lastUpdate: "1 Maret 2025",
    content: [
      {
        type: "text",
        content:
          "Akses laporan tahunan pemerintah daerah sebagai bentuk pertanggungjawaban kepada masyarakat.",
      },
    ],
    relatedInfo: ["laporan-kinerja", "statistik-daerah"],
    downloads: [
      { name: "LPPD 2024", format: "PDF", size: "20 MB" },
      { name: "LPPD 2023", format: "PDF", size: "18 MB" },
    ],
  },

  // Buku Profil
  {
    slug: "buku-profil",
    icon: BookOpen,
    name: "Buku Profil Daerah",
    description: "Profil lengkap kabupaten dalam bentuk buku digital",
    fullDescription:
      "Buku profil daerah yang memuat informasi lengkap tentang Kabupaten Naiera.",
    category: "Publikasi",
    categorySlug: "publication",
    stats: "5 edisi",
    lastUpdate: "1 Juli 2024",
    content: [
      {
        type: "text",
        content:
          "Kenali Kabupaten Naiera lebih dekat melalui buku profil daerah yang komprehensif.",
      },
    ],
    relatedInfo: ["statistik-daerah", "destinasi-wisata"],
    downloads: [
      { name: "Profil Daerah 2024", format: "PDF", size: "45 MB" },
      { name: "Profil Daerah 2023", format: "PDF", size: "42 MB" },
    ],
  },
];

export default async function InformasiPublikDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const info = infoData.find((i) => i.slug === slug);

  if (!info) {
    notFound();
  }

  const InfoIcon = info.icon;

  return (
    <main className="bg-slate-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16 text-white">
          <div className="container mx-auto max-w-5xl px-4">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-blue-100">
              <Link href="/" className="hover:text-white">
                Beranda
              </Link>
              <ChevronRight size={14} />
              <Link href="/informasi-publik" className="hover:text-white">
                Informasi Publik
              </Link>
              <ChevronRight size={14} />
              <span className="text-white">{info.name}</span>
            </nav>

            {/* Header */}
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <InfoIcon size={40} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold md:text-4xl">
                    {info.name}
                  </h1>
                  {info.badge && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        info.badge === "Update"
                          ? "bg-blue-400 text-blue-900"
                          : info.badge === "Baru"
                            ? "bg-amber-400 text-amber-900"
                            : info.badge === "Populer"
                              ? "bg-emerald-400 text-emerald-900"
                              : "bg-purple-400 text-purple-900"
                      }`}
                    >
                      {info.badge}
                    </span>
                  )}
                </div>
                <p className="mb-4 text-lg text-blue-50">
                  {info.fullDescription}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Update: {info.lastUpdate}</span>
                  </div>
                  {info.stats && (
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      <span>{info.stats}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Bookmark size={16} />
                    <span>{info.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20">
                <Share2 size={16} />
                Bagikan
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20">
                <Printer size={16} />
                Cetak
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20">
                <Bookmark size={16} />
                Simpan
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column - Main Content */}
              <div className="space-y-8 lg:col-span-2">
                {/* Content Sections */}
                {info.content.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    {item.type === "text" && (
                      <p className="leading-relaxed text-slate-700">
                        {item.content as string}
                      </p>
                    )}

                    {item.type === "highlight" && (
                      <>
                        {item.title && (
                          <h3 className="mb-3 font-bold text-slate-800">
                            {item.title}
                          </h3>
                        )}
                        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-blue-800">
                          <p className="font-medium">
                            {item.content as string}
                          </p>
                        </div>
                      </>
                    )}

                    {item.type === "list" && (
                      <>
                        {item.title && (
                          <h3 className="mb-4 font-bold text-slate-800">
                            {item.title}
                          </h3>
                        )}
                        <ul className="space-y-3">
                          {(item.content as string[]).map((listItem, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <ChevronRight
                                className="mt-0.5 shrink-0 text-blue-600"
                                size={18}
                              />
                              <span className="text-slate-700">{listItem}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}

                {/* Downloads */}
                {info.downloads && info.downloads.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
                      <Download className="text-blue-600" size={24} />
                      Unduh Dokumen
                    </h2>
                    <div className="space-y-3">
                      {info.downloads.map((doc, index) => (
                        <a
                          key={index}
                          href="#"
                          className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="text-blue-600" size={20} />
                            <div>
                              <span className="font-medium text-slate-700">
                                {doc.name}
                              </span>
                              <p className="text-xs text-slate-500">
                                {doc.format} • {doc.size}
                              </p>
                            </div>
                          </div>
                          <Download className="text-slate-400" size={20} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                {info.externalLinks && info.externalLinks.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
                      <ExternalLink className="text-blue-600" size={24} />
                      Link Terkait
                    </h2>
                    <div className="space-y-3">
                      {info.externalLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
                        >
                          <div>
                            <span className="font-medium text-slate-700">
                              {link.name}
                            </span>
                            <p className="text-sm text-slate-500">
                              {link.description}
                            </p>
                          </div>
                          <ExternalLink className="text-slate-400" size={20} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                {info.contactInfo && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-800">
                      Hubungi Kami
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2
                          className="mt-0.5 shrink-0 text-blue-600"
                          size={18}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {info.contactInfo.office}
                          </p>
                          <p className="text-sm text-slate-500">
                            {info.contactInfo.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="shrink-0 text-blue-600" size={18} />
                        <p className="text-sm text-slate-700">
                          {info.contactInfo.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="shrink-0 text-blue-600" size={18} />
                        <p className="text-sm text-slate-700">
                          {info.contactInfo.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="shrink-0 text-blue-600" size={18} />
                        <p className="text-sm text-slate-700">
                          {info.contactInfo.hours}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-bold text-slate-800">Informasi</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Bookmark size={16} />
                        Kategori
                      </div>
                      <p className="text-slate-800">{info.category}</p>
                    </div>
                    {info.stats && (
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Eye size={16} />
                          Statistik
                        </div>
                        <p className="text-slate-800">{info.stats}</p>
                      </div>
                    )}
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Clock size={16} />
                        Terakhir Diperbarui
                      </div>
                      <p className="text-slate-800">{info.lastUpdate}</p>
                    </div>
                  </div>
                </div>

                {/* Related Info */}
                {info.relatedInfo && info.relatedInfo.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-800">
                      Informasi Terkait
                    </h3>
                    <div className="space-y-2">
                      {info.relatedInfo.map((relatedSlug) => {
                        const relatedInfo = infoData.find(
                          (i) => i.slug === relatedSlug
                        );
                        if (!relatedInfo) return null;
                        const RelatedIcon = relatedInfo.icon;
                        return (
                          <Link
                            key={relatedSlug}
                            href={`/informasi-publik/${relatedSlug}`}
                            className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <RelatedIcon size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-800">
                                {relatedInfo.name}
                              </p>
                            </div>
                            <ArrowRight className="text-slate-400" size={16} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Back to Portal */}
                <Link
                  href="/informasi-publik"
                  className="block w-full rounded-xl border border-blue-200 bg-blue-50 px-6 py-4 text-center font-semibold text-blue-700 transition-all hover:bg-blue-100"
                >
                  ← Kembali ke Portal
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
