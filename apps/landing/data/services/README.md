# Struktur Data Layanan

## Deskripsi
Dokumentasi ini menjelaskan struktur data layanan yang diambil dari direktori.

## Struktur Direktori

```
data/services/
├── categories.json          # Daftar semua kategori layanan
├── population.json          # Layanan kategori Kependudukan
├── health.json              # Layanan kategori Kesehatan
├── education.json           # Layanan kategori Pendidikan
├── economy.json             # Layanan kategori Ekonomi
├── manpower.json            # Layanan kategori Ketenagakerjaan
├── tourism.json             # Layanan kategori Pariwisata
├── infrastructure.json      # Layanan kategori Infrastruktur
├── social.json              # Layanan kategori Sosial
├── environment.json         # Layanan kategori Lingkungan
├── government.json          # Layanan kategori Pemerintahan
├── ppid.json                # Layanan kategori PPID
├── disaster.json            # Layanan kategori Kebencanaan
└── multisector.json         # Layanan kategori Multisektor
```

## Format Data

### Category (categories.json)

```json
{
  "id": "population",           // ID unik kategori
  "name": "Kependudukan",        // Nama kategori (Indonesia)
  "icon": "Users",               // Nama icon dari lucide-react
  "color": "primary",            // Warna tema
  "bgColor": "bg-primary-lighter", // Background color class
  "slug": "population",          // URL-friendly ID
  "showInMenu": true,            // Tampilkan di mega menu (true/false)
  "order": 1                     // Urutan tampilan
}
```

### Service (category-name.json)

```json
{
  "slug": "e-ktp",               // ID unik layanan (untuk URL)
  "icon": "IdCard",              // Nama icon dari lucide-react
  "name": "E-KTP",               // Nama layanan
  "description": "Deskripsi singkat layanan",
  "categoryId": "population",    // ID kategori yang terkait
  "badge": "Populer",            // Opsional: Badge status (Populer/Baru/Penting)
  "stats": "5.2k",               // Opsional: Statistik penggunaan
  "showInMenu": true,            // Tampilkan di mega menu (true/false)
  "order": 1                     // Urutan tampilan dalam kategori
}
```

## 🎛️ Kontrol Tampilan Mega Menu

### Fitur showInMenu

Flag `showInMenu` memungkinkan Anda mengontrol layanan mana yang muncul di mega menu navigasi:

- **`showInMenu: true`** - Layanan tampil di mega menu
- **`showInMenu: false`** - Layanan disembunyikan dari mega menu tapi tetap bisa diakses langsung

### Field order

Field `order` mengontrol urutan tampilan:
- Nomor lebih kecil = tampil lebih awal
- Jika tidak diisi, default ke urutan di file JSON

### Contoh Pengaturan

#### 1. Kategori dan Layanan yang Tampil di Menu
```json
// categories.json
{
  "id": "population",
  "showInMenu": true,   // ✅ Tampil di menu
  "order": 1
}

// population.json
{
  "slug": "e-ktp",
  "showInMenu": true,   // ✅ Tampil di menu
  "order": 1
}
```

#### 2. Kategori/Layanan yang Disembunyikan dari Menu
```json
// categories.json
{
  "id": "infrastructure",
  "showInMenu": false,  // ❌ Tidak tampil di menu
  "order": 7
}

// infrastructure.json
{
  "slug": "transportasi-umum",
  "showInMenu": false,  // ❌ Tidak tampil di menu
  "order": 3
}
```

**Catatan Penting:**
- Layanan dengan `showInMenu: false` **TIDAK DIHAPUS**, hanya disembunyikan dari menu
- Layanan tetap bisa diakses langsung melalui URL atau halaman layanan lengkap
- Berguna untuk layanan yang kurang umum atau layanan internal

### Konfigurasi Saat Ini

#### Kategori yang Tampil di Mega Menu (9):
1. ✅ Kependudukan (order: 1)
2. ✅ Kesehatan (order: 2)
3. ✅ Pendidikan (order: 3)
4. ✅ Ekonomi (order: 4)
5. ✅ Ketenagakerjaan (order: 5)
6. ✅ Pariwisata (order: 6)
7. ✅ Lingkungan (order: 9)
8. ✅ PPID (order: 11)
9. ✅ Kebencanaan (order: 12)

#### Kategori yang Disembunyikan (4):
- ❌ Infrastruktur (showInMenu: false)
- ❌ Sosial (showInMenu: false)
- ❌ Pemerintahan (showInMenu: false)
- ❌ Multisektor (showInMenu: false)

#### Layanan yang Disembunyikan dari Menu:
- Kesehatan: Posyandu
- Pendidikan: Surat Keterangan Sekolah
- Ekonomi: Bantuan Modal UMKM
- Ketenagakerjaan: Pelatihan Kerja
- Pariwisata: Izin Event
- Infrastruktur: Transportasi Umum
- Sosial: DTKS
- Lingkungan: Aduan Lingkungan
- Pemerintahan: Dana Desa

## Fungsi Data Fetching

### lib/services-data.ts

```typescript
// Ambil semua kategori (termasuk yang showInMenu: false)
getServiceCategories(): Promise<ServiceCategory[]>

// Ambil hanya kategori yang showInMenu: true (untuk mega menu)
getVisibleServiceCategories(): Promise<ServiceCategory[]>

// Ambil layanan per kategori
getServicesByCategory(categoryId: string): Promise<Service[]>

// Ambil semua layanan dengan info kategori
getAllServices(): Promise<ServiceWithCategory[]>

// Ambil kategori dengan layanan (semuanya)
getServicesGroupedByCategory(): Promise<ServiceCategory[]>

// Ambil kategori dengan layanan (hanya yang showInMenu: true)
getVisibleServicesGroupedByCategory(): Promise<ServiceCategory[]>

// Ambil satu layanan berdasarkan slug
getServiceBySlug(slug: string): Promise<ServiceWithCategory | null>

// Ambil kategori berdasarkan slug
getCategoryBySlug(slug: string): Promise<ServiceCategory | null>
```

## Cara Menggunakan showInMenu

### Menyembunyikan Layanan dari Menu

```json
// data/services/health.json
{
  "slug": "posyandu",
  "showInMenu": false,  // Sembunyikan dari mega menu
  "order": 3
}
```

**Hasil:**
- ❌ Tidak muncul di mega menu navigasi
- ✅ Tetap muncul di halaman `/layanan`
- ✅ Tetap bisa diakses langsung via URL `/layanan/posyandu`
- ✅ Tetap muncul di hasil pencarian

### Menampilkan Layanan di Menu

```json
{
  "slug": "bpjs-kesehatan",
  "showInMenu": true,   // Tampilkan di mega menu
  "order": 1
}
```

**Hasil:**
- ✅ Muncul di mega menu navigasi
- ✅ Muncul di halaman `/layanan`
- ✅ Bisa diakses via URL

### Mengubah Urutan Tampilan

```json
// health.json
[
  {
    "slug": "bpjs-kesehatan",
    "order": 1  // Tampil pertama
  },
  {
    "slug": "puskesmas",
    "order": 2  // Tampil kedua
  },
  {
    "slug": "posyandu",
    "order": 3  // Tampil ketiga
  }
]
```

### Menyembunyikan Kategori dari Menu

```json
// categories.json
{
  "id": "infrastructure",
  "showInMenu": false,  // Sembunyikan seluruh kategori dari menu
  "order": 7
}
```

**Hasil:**
- ❌ Kategori tidak muncul di mega menu
- ❌ Semua layanan di kategori ini tidak muncul di menu
- ✅ Kategori tetap muncul di halaman `/layanan`
- ✅ Layanan tetap bisa diakses langsung

## Best Practices

### Kapan Menggunakan showInMenu: false

1. **Layanan Kurang Populer**
   - Layanan yang jarang diakses
   - Contoh: Pelatihan Kerja, Surat Keterangan Sekolah

2. **Layanan Internal**
   - Layanan untuk instansi pemerintah
   - Contoh: Dana Desa, DTKS

3. **Layanan Spesifik**
   - Layanan dengan kasus penggunaan sangat spesifik
   - Contoh: Izin Event, Transportasi Umum

4. **Layanan Sementara**
   - Layanan musiman atau promosi sementara
   - Bisa di-toggle showInMenu sesuai kebutuhan

### Kapan Menggunakan showInMenu: true

1. **Layanan Populer**
   - Layanan yang sering diakses
   - Contoh: E-KTP, KK, BPJS

2. **Layanan Prioritas**
   - Layanan utama yang ingin dipromosikan
   - Layanan dengan badge "Populer" atau "Baru"

3. **Layanan Publik Umum**
   - Layanan yang dibutuhkan masyarakat luas
   - Contoh: PPDB, Beasiswa

### Urutan Order yang Disarankan

**Layanan Prioritas Utama (order: 1-3):**
- E-KTP, KK, BPJS Kesehatan
- Layanan dengan badge "Populer"

**Layanan Penting (order: 4-6):**
- Beasiswa, PPDB
- Layanan kesehatan lain

**Layanan Pendukung (order: 7+):**
- Layanan spesifik
- Layanan tambahan

## Icon Mapping

Icon menggunakan library [lucide-react](https://lucide.dev/icons/).

Contoh nama icon yang valid:
- `Users`, `HeartPulse`, `GraduationCap`, `Briefcase`
- `IdCard`, `FileText`, `FileCheck`, `Building`
- `MapPin`, `ShieldAlert`, `Search`, dll.

Untuk mencari icon lain, kunjungi: https://lucide.dev/icons/

## Cara Menambah Layanan Baru

### 1. Menambah Layanan ke Kategori yang Sudah Ada

Edit file JSON kategori yang sesuai:

```json
// data/services/health.json
{
  "slug": "layanan-baru",
  "icon": "Stethoscope",
  "name": "Layanan Baru",
  "description": "Deskripsi layanan baru",
  "categoryId": "health",
  "stats": "1.2k",
  "showInMenu": true,   // Tampilkan di menu
  "order": 4           // Urutan ke-4
}
```

### 2. Menambah Kategori Baru

1. Tambahkan ke `categories.json`:

```json
{
  "id": "new-category",
  "name": "Kategori Baru",
  "icon": "IconName",
  "color": "blue",
  "bgColor": "bg-blue-50",
  "slug": "new-category",
  "showInMenu": true,   // Tampilkan di mega menu
  "order": 14          // Urutan paling akhir
}
```

2. Buat file JSON baru:

```bash
# data/services/new-category.json
[
  {
    "slug": "service-1",
    "icon": "IconName",
    "name": "Nama Layanan",
    "description": "Deskripsi layanan",
    "categoryId": "new-category",
    "stats": "500",
    "showInMenu": true,
    "order": 1
  }
]
```

## Troubleshooting

### Layanan tidak muncul di mega menu
1. Periksa apakah `showInMenu: true`
2. Periksa apakah kategorinya juga `showInMenu: true`
3. Pastikan `slug` bersifat unik

### Urutan tidak sesuai
1. Periksa field `order`
2. Nomor lebih kecil = tampil lebih awal
3. Pastikan tidak ada duplikasi nomor order

### Layanan tidak muncul sama sekali
1. Periksa apakah `categoryId` cocok dengan kategori
2. Pastikan file JSON valid (bisa dicek dengan JSON validator)
3. Pastikan slug bersifat unik

### Icon tidak muncul
1. Periksa nama icon di https://lucide.dev/icons/
2. Pastikan nama icon ditulis dengan PascalCase
3. Cek spelling icon name

### Perbedaan getAllServices vs getVisibleServicesGroupedByCategory

- **getAllServices()** - Mengambil SEMUA layanan (termasuk yang showInMenu: false)
  - Gunakan untuk halaman `/layanan` (halaman lengkap)

- **getVisibleServicesGroupedByCategory()** - Hanya layanan dengan showInMenu: true
  - Gunakan untuk mega menu navigasi

## Ringkasan Fitur showInMenu

| Fitur | getAllServices() | getVisibleServicesGroupedByCategory() |
|-------|------------------|--------------------------------------|
| Mega Menu | ❌ | ✅ |
| Halaman Layanan Lengkap | ✅ | ✅ (jika digunakan) |
| Pencarian | ✅ | ❌ (mungkin tidak lengkap) |
| URL Langsung | ✅ | ✅ |

**Rekomendasi Penggunaan:**
- **Mega Menu**: Gunakan `getVisibleServicesGroupedByCategory()`
- **Halaman Layanan**: Gunakan `getServicesGroupedByCategory()` atau `getAllServices()`
- **Pencarian**: Gunakan `getAllServices()`
