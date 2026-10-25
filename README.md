# LyraSync AI

**Fit the Lyrics. Feel the Melody.**

Ekstensi Chrome (Manifest V3) untuk membantu mengadaptasi lirik lagu ke bahasa Indonesia yang natural dan nyaman dinyanyikan, mengikuti durasi, ritme, dan tekanan kata melodi referensi.

## Status proyek

Fase 3 — audio lokal, timestamp manual, overlay terkoordinasi. Status fase dan kriteria kelulusan: lihat `ROADMAP.md`. Keputusan & arsitektur: `PROJECT_BRAIN.md`.

## Fitur saat ini (Fase 3)

- Membuat, membuka, mengubah judul, dan menghapus proyek (hapus dengan konfirmasi dua langkah).
- Editor per frasa dengan tiga kolom teks independen: **Sumber**, **Romanisasi**, **Bahasa Indonesia**, plus catatan bebas (jeda/nada panjang/bagian sulit).
- **Impor audio lokal** (disimpan sebagai bytes di IndexedDB — tidak pernah diunggah; batas 100 MB) dengan putar/jeda, slider seek, dan tampilan durasi.
- **Timestamp manual** per frasa: ketik format `m:ss.d` (invalid dikembalikan aman) atau ambil posisi pemutar lewat tombol "Set mulai/akhir".
- **Overlay terkoordinasi**: frasa yang rentang waktunya memuat posisi audio disorot otomatis (auto-scroll), menampilkan Sumber/Romanisasi/Indonesia berdampingan; klik baris untuk melompat.
- Autosave ke IndexedDB (debounce 400 ms; flush saat pindah tab atau panel ditutup) dengan indikator status.
- Ekspor: salin lirik berformat ke clipboard dan unduh backup JSON.
- Validasi dasar: judul wajib, record korup dilewati tanpa menggagalkan proyek lain.

## Prasyarat

- Node.js ≥ 20 (dikembangkan dengan Node 24.16, npm 11.13)
- npm

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm install` | Instal dependensi |
| `npm run dev` | Dev server Vite (UI saja, di luar konteks ekstensi) |
| `npm run build` | Build produksi ke `dist/` |
| `npm run typecheck` | Pemeriksaan tipe (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run test` | Unit test (Vitest) |
| `npm run test:e2e` | Smoke test memuat ekstensi di Chromium (Playwright) |
| `npm run verify` | Semua di atas berurutan — wajib hijau sebelum commit |

## Memuat ekstensi ke Chrome secara manual

1. `npm run build`
2. Buka `chrome://extensions`
3. Aktifkan **Developer mode**
4. **Load unpacked** → pilih folder `dist/`
5. Klik ikon LyraSync AI di toolbar → side panel terbuka

Catatan: butuh Chrome/Chromium ≥ 114 (`minimum_chrome_version` di manifest).

## Pengujian otomatis

`npm run test:e2e` memuat build `dist/` sebagai ekstensi unpacked ke Chromium penuh (Playwright, `channel: 'chromium'`) lalu memverifikasi: service worker aktif, sidepanel dirender, navigasi antar-tab bekerja, dan tidak ada error konsol/halaman. Headless shell default Playwright **tidak** mendukung ekstensi — karena itu channel `chromium` wajib.

## Batasan (Fase 3)

- Tidak ada estimasi suku kata, kandidat adaptasi, atau AI — Fase 4–5.
- Analisis audio otomatis (beat/onset/pitch) **sengaja tidak ada** — audio adalah referensi timing yang dikoreksi manual; sesuai prinsip proyek.
- Kecepatan putar & loop frasa belum ada.
- Belum ada undo/redo; ada backup JSON sebagai jaring pengaman.
- Clipboard tidak di-assert di E2E (keterbatasan headless); fungsi teks ekspor diuji unit test, tombol salin diuji manual.
- Ikon ekstensi belum dibuat (memakai ikon default Chrome).
- E2E otomatis memakai Chromium; pemuatan manual di Chrome branded dianjurkan (lihat `TEST_CHECKLIST.md` bagian B).

## Privasi

Fase 1 tidak mengirimkan data apa pun ke layanan eksternal; satu-satunya izin adalah `sidePanel`. Audio dan lirik pribadi tidak pernah masuk git (`local/` dan `*.mp3` di `.gitignore`).
