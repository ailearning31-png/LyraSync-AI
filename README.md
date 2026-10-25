# LyraSync AI

**Fit the Lyrics. Feel the Melody.**

Ekstensi Chrome (Manifest V3) untuk membantu mengadaptasi lirik lagu ke bahasa Indonesia yang natural dan nyaman dinyanyikan, mengikuti durasi, ritme, dan tekanan kata melodi referensi.

## Status proyek

Fase 4 — pembantu evaluasi kandidat. Status fase dan kriteria kelulusan: lihat `ROADMAP.md`. Keputusan & arsitektur: `PROJECT_BRAIN.md`.

## Fitur saat ini (Fase 4)

- Membuat, membuka, mengubah judul, dan menghapus proyek (hapus dengan konfirmasi dua langkah).
- Editor per frasa: **Sumber**, **Romanisasi**, **Bahasa Indonesia** (adaptasi terpilih), catatan jeda/nada panjang.
- **Impor audio lokal** (IndexedDB, tidak pernah diunggah; batas 100 MB) + putar/jeda/seek/durasi.
- **Timestamp manual** (`m:ss.d` atau ambil posisi pemutar) dan **overlay** yang menyorot frasa aktif mengikuti audio.
- **Tiga kandidat per frasa** (A meaning-first / B balanced / C singability-first) dengan tombol "Gunakan" untuk menerapkan sebagai adaptasi terpilih.
- **Estimasi suku kata otomatis** (Indonesia & mora Jepang; kanji ditandai tidak pasti) yang **dapat dikoreksi manual**.
- **Heuristik kepadatan** kandidat vs sumber (per detik) dengan chip risiko — semua **berlabel estimasi**, ambang masih hipotesis.
- **Skor manual 1–5** untuk 5 dimensi + total berbobot (hipotesis 30/20/20/20/10; "belum cukup data" bila belum lengkap).
- **Tabel perbandingan berdampingan** per frasa.
- **Ekspor**: salin lirik, unduh backup JSON, dan **unduh catatan eksperimen (.md)** siap tempel ke log eksperimen.
- Autosave IndexedDB dengan indikator status; validasi dasar & pemulihan record korup.

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

## Batasan (Fase 4)

- Estimasi suku kata **adalah heuristik** (nama, singkatan, dan ejaan tak baku bisa meleset) — koreksi manual disediakan dan diutamakan.
- Ambang risiko (1,25/0,7) dan bobot skor (30/20/20/20/10) **masih hipotesis** — menunggu kalibrasi dari eksperimen nyata (EXP-0001).
- Belum ada AI/regenerasi kandidat (Fase 5 — butuh keputusan penyedia & kredensial), analisis audio otomatis (Fase 6, opsional), undo/redo.
- Clipboard tidak di-assert di E2E (keterbatasan headless); fungsi teks ekspor diuji unit test, tombol salin diuji manual.
- Ikon ekstensi belum dibuat; E2E memakai Chromium — muat manual di Chrome branded dianjurkan (`TEST_CHECKLIST.md` bagian B).

## Privasi

Fase 1 tidak mengirimkan data apa pun ke layanan eksternal; satu-satunya izin adalah `sidePanel`. Audio dan lirik pribadi tidak pernah masuk git (`local/` dan `*.mp3` di `.gitignore`).
