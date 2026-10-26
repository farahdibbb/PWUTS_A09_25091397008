# HOLA Laundry – Portal Pelanggan (UTS Pemrograman Web)

Topik: **Sistem Informasi Manajemen Laundry "HOLA" (Horas Laundry)**.
Bagian yang dikerjakan: **modul Pelanggan**, yaitu cek status cucian lewat nomor resi dan pengiriman ulasan.
Dibuat tanpa PHP, hanya **HTML, CSS, dan jQuery**.

## Pemenuhan item UTS

| Item UTS | File | Keterangan |
|---|---|---|
| 2.a Homepage responsif | `index.html`, `css/style.css`, `js/main.js`, `pages/beranda.html` | Layout utama dengan header, menu hamburger di layar kecil (≤ 760px), dan mode terang/gelap (pilihan disimpan di `localStorage`). Menu memuat halaman dengan **Ajax** (`$.load`) tanpa refresh. |
| 2.b Halaman konten | `pages/status.html` | Cek status cucian lewat 4 digit terakhir resi (data simulasi). Menampilkan indikator progres tiga tahap, detail pesanan, total biaya, dan status pembayaran. |
| 2.c Halaman form | `pages/ulasan.html` | Form ulasan dengan validasi jQuery sebelum dikirim via Ajax POST ke server HTTP publik (`jsonplaceholder.typicode.com`). |

## Fitur

**Navigasi dan tampilan**
- Pindah halaman lewat Ajax. Tombol *back/forward* browser tetap berfungsi (`pushState` dan `popstate`).
- Pesan galat yang jelas bila halaman gagal dimuat (misalnya file dibuka langsung tanpa server).
- Tema terang/gelap mengikuti preferensi sistem pada kunjungan pertama.
- Fokus keyboard terlihat, `aria-live` pada konten, dan animasi dimatikan bila `prefers-reduced-motion` aktif.

**Cek status cucian**
- Input resi hanya menerima angka dan harus tepat 4 digit.
- Tahap status: *Sedang Diproses → Siap Diambil → Selesai*.
- Pesan kontekstual: pengingat melunasi pembayaran bila belum lunas, informasi siap diambil, dan tautan "Tulis ulasan" bila sudah selesai (resi terisi otomatis di form ulasan).
- Tombol resi contoh untuk mencoba cepat.

**Form ulasan**
- Field: nama, 4 digit resi, rating bintang (1–5), kategori yang dinilai, komentar, dan persetujuan.
- Aturan validasi:
  - Nama wajib, minimal 3 karakter, hanya huruf, spasi, titik, apostrof, atau tanda hubung.
  - Resi harus 4 digit, terdaftar, berstatus **Selesai**, dan belum pernah diulas.
  - Rating dan kategori wajib dipilih.
  - Komentar 10–300 karakter, dengan penghitung karakter langsung.
  - Persetujuan wajib dicentang.
- Pesan galat muncul saat field ditinggalkan (blur) dan diperbarui saat mengetik. Saat submit, fokus pindah ke field pertama yang salah.
- Ulasan yang berhasil terkirim disimpan di `localStorage` dan ditampilkan bersama rata-rata rating.

## Struktur folder

```
PWUTS_KODE_NIM/
├── index.html          # layout utama (header, navigasi, area konten)
├── css/
│   └── style.css       # gaya, tema terang/gelap, responsif
├── js/
│   └── main.js         # navigasi Ajax, tema, status cucian, validasi dan kirim ulasan
└── pages/
    ├── beranda.html    # halaman beranda
    ├── status.html     # halaman cek status
    └── ulasan.html     # halaman form ulasan
```

## Cara menjalankan

Halaman dimuat dengan Ajax, jadi harus dibuka lewat server, bukan dengan klik dua kali `index.html` (`file://` diblokir browser).

- **GitHub Pages** (disarankan): Settings → Pages → pilih branch `main`, lalu buka `https://<id>.github.io/<repo>/PWUTS_<kode>_<nim>/`.
- **VS Code + Live Server**: klik kanan `index.html` → *Open with Live Server*.
- **Laragon / XAMPP**: letakkan folder di `www` atau `htdocs`, lalu buka lewat `localhost`.

Koneksi internet diperlukan untuk memuat jQuery (cdnjs), font Google, dan mengirim ulasan ke `jsonplaceholder.typicode.com`.

## Data demo

| Resi | Nama | Status | Pembayaran |
|---|---|---|---|
| `1234` | Budi S. | Sedang Diproses | Belum Lunas |
| `5678` | Sari W. | Siap Diambil | Lunas |
| `9012` | Andi P. | Siap Diambil | Belum Lunas |
| `3456` | Rina K. | Selesai | Lunas |
| `7788` | Dewi L. | Selesai | Lunas |

Hanya resi **`3456`** dan **`7788`** yang bisa diulas, karena statusnya sudah Selesai.

## Teknologi

HTML5, CSS3 (variabel CSS, grid, flexbox, `color-mix`), jQuery 3.7.1, `localStorage`, dan Ajax (`$.load`, `$.ajax`).
