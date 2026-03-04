# Dokumentasi Data Berita dan Agenda

## Deskripsi
Dokumentasi ini menjelaskan struktur data berita dan agenda yang diambil dari direktori.

## Struktur Direktori

```
data/
├── news/
│   └── articles.json         # Daftar semua artikel berita
└── events/
    └── agenda.json           # Daftar semua agenda/events
```

## Format Data

### News Article (news/articles.json)

```json
{
  "id": "1",                    // ID unik berita
  "slug": "judul-berita",       // URL-friendly slug
  "title": "Judul Berita",      // Judul lengkap
  "excerpt": "Ringkasan berita...", // Ringkasan singkat
  "category": "Kategori",       // Kategori berita
  "date": "2026-01-13",         // Tanggal publikasi (ISO format)
  "image": "/images/news-1.jpg", // Path gambar
  "author": "Nama Penulis",     // Penulis/Instansi
  "readTime": "3 menit",        // Estimasi waktu baca
  "featured": true,             // Apakah ditampilkan di featured
  "tags": ["tag1", "tag2"]      // Tag/keywords
}
```

### Event (events/agenda.json)

```json
{
  "id": "1",                    // ID unik event
  "slug": "judul-event",        // URL-friendly slug
  "title": "Judul Event",       // Judul lengkap
  "date": "2026-01-20",         // Tanggal event (ISO format)
  "time": "08:00 - 17:00",      // Jam event
  "location": "Lokasi Event",   // Nama lokasi
  "category": "Kategori",       // Kategori event
  "attendees": "500+",          // Jumlah peserta (opsional)
  "status": "upcoming",         // Status: upcoming|ongoing|completed
  "type": "offline",            // Tipe: online|offline|hybrid
  "image": "/images/event-1.jpg", // Path gambar (opsional)
  "description": "Deskripsi...", // Deskripsi lengkap (opsional)
  "organizer": "Penyelenggara",  // Nama penyelenggara
  "registrationRequired": true, // Apakah perlu registrasi
  "maxAttendees": 500           // Max peserta (null jika unlimited)
}
```

## Fungsi Data Fetching

### News (lib/news-data.ts)

```typescript
// Ambil semua berita
getAllNews(): Promise<NewsArticle[]>

// Ambil berita featured
getFeaturedNews(): Promise<NewsArticle[]>

// Ambil berita terbaru (limit)
getRecentNews(limit: number): Promise<NewsArticle[]>

// Ambil berita berdasarkan kategori
getNewsByCategory(category: string): Promise<NewsArticle[]>

// Ambil satu berita berdasarkan slug
getNewsBySlug(slug: string): Promise<NewsArticle | null>

// Ambil semua kategori berita
getNewsCategories(): Promise<string[]>
```

### Events (lib/events-data.ts)

```typescript
// Ambil semua events
getAllEvents(): Promise<Event[]>

// Ambil upcoming events
getUpcomingEvents(limit?: number): Promise<Event[]>

// Ambil events berdasarkan status
getEventsByStatus(status): Promise<Event[]>

// Ambil events berdasarkan kategori
getEventsByCategory(category: string): Promise<Event[]>

// Ambil satu event berdasarkan slug
getEventBySlug(slug: string): Promise<Event | null>

// Ambil events per bulan
getEventsByMonth(year: number, month: number): Promise<Event[]>

// Ambil semua kategori event
getEventCategories(): Promise<string[]>

// Ambil tanggal yang ada event untuk kalender
getEventDays(year: number, month: number): Promise<number[]>
```

## Cara Menambah Data

### Menambah Berita Baru

Edit file `data/news/articles.json`:

```json
{
  "id": "7",
  "slug": "berita-baru-2026",
  "title": "Judul Berita Baru",
  "excerpt": "Ringkasan berita baru yang menarik...",
  "category": "Teknologi",
  "date": "2026-01-15",
  "image": "/images/news-7.jpg",
  "author": "Dinas Komunikasi dan Informatika",
  "readTime": "4 menit",
  "featured": false,
  "tags": ["teknologi", "inovasi"]
}
```

**Penting:**
- `id` harus unik
- `slug` harus unik dan URL-friendly (gunakan huruf kecil, strip/hyphen untuk spasi)
- `date` gunakan format ISO: YYYY-MM-DD
- `featured` set ke `true` jika ingin ditampilkan di section featured

### Menambah Event Baru

Edit file `data/events/agenda.json`:

```json
{
  "id": "9",
  "slug": "event-baru-2026",
  "title": "Nama Event Baru",
  "date": "2026-02-20",
  "time": "09:00 - 16:00",
  "location": "Nama Lokasi",
  "category": "Pemerintahan",
  "attendees": "200",
  "status": "upcoming",
  "type": "offline",
  "image": "/images/event-9.jpg",
  "description": "Deskripsi lengkap event...",
  "organizer": "Nama Penyelenggara",
  "registrationRequired": true,
  "maxAttendees": 200
}
```

**Penting:**
- `id` harus unik
- `slug` harus unik dan URL-friendly
- `date` gunakan format ISO: YYYY-MM-DD
- `status`: "upcoming" (akan datang), "ongoing" (sedang berlangsung), "completed" (selesai)
- `type`: "online" (daring), "offline" (lokal), "hybrid" (campuran)
- `maxAttendees`: set ke `null` jika kapasitas tidak terbatas

## Update Status Event

Secara berkala update status event yang sudah lewat:

```json
{
  "status": "completed"  // Ubah dari "upcoming" ke "completed"
}
```

## Best Practices

### Penulisan Slug
- Gunakan huruf kecil semua
- Ganti spasi dengan strip/hyphen (-)
- Hindari karakter khusus
- Contoh: "peresmian-gedung-baru" ✓
- Contoh: "Peresmian Gedung Baru" ✗
- Contoh: "peresmian_gedung_baru" ✗

### Kategori yang Umum Digunakan

**Berita:**
- Teknologi
- Ekonomi
- Kesehatan
- Pendidikan
- Lingkungan
- Pariwisata
- Pemerintahan
- Olahraga

**Events:**
- Pemerintahan
- Ekonomi
- Kesehatan
- Pendidikan
- Pariwisata
- Olahraga
- Sosial

### Penulisan Tanggal
Gunakan selalu format ISO: `YYYY-MM-DD`
- ✅ "2026-01-15"
- ❌ "15/01/2026"
- ❌ "Januari 15, 2026"

### Status Event yang Tepat
1. **upcoming**: Event yang belum dimulai
2. **ongoing**: Event yang sedang berlangsung saat ini
3. **completed**: Event yang sudah selesai

## Troubleshooting

### Berita/Event tidak muncul
1. Periksa apakah JSON valid (bisa dicek dengan JSON validator online)
2. Pastikan `id` bersifat unik
3. Pastikan `slug` tidak ada duplikat
4. Cek format tanggal (harus YYYY-MM-DD)

### Status event tidak sesuai
- Pastikan status di-update secara berkala
- Event yang sudah lewat tanggalnya sebaiknya diubah ke "completed"

### Featured berita tidak muncul
- Pastikan field `featured` diset ke `true`
- Hanya berita dengan `featured: true` yang akan muncul di section featured

### Error saat membuka halaman
1. Cek syntax JSON
2. Pastikan tidak ada comma ekstra di akhir array/object
3. Validasi JSON di https://jsonlint.com/

## Contoh Penggunaan di Komponen

### Server Component

```typescript
import { getRecentNews, getAllEvents } from '@/lib/news-data';
import { NewsSectionClient } from '@/components/news-client';

export default async function BeritaPage() {
  const news = await getRecentNews(6);

  return <NewsSectionClient news={news} />;
}
```

### Client Component dengan Props

```typescript
interface NewsClientProps {
  news: NewsArticle[];
}

export function NewsClient({ news }: NewsClientProps) {
  return (
    <div>
      {news.map(article => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```
