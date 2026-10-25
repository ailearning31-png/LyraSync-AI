# LyraSync AI

**Fit the Lyrics. Feel the Melody.**

Ekstensi Chrome (Manifest V3) untuk membantu mengadaptasi lirik lagu ke bahasa Indonesia yang natural dan nyaman dinyanyikan, mengikuti durasi, ritme, dan tekanan kata melodi referensi.

## Status proyek

Fase 6 — analisis audio otomatis (MVP, lokal). Status fase dan kriteria kelulusan: lihat `ROADMAP.md`. Keputusan & arsitektur: `PROJECT_BRAIN.md`.

## Fitur saat ini (Fase 6)

- Membuat, membuka, mengubah judul, dan menghapus proyek (hapus dengan konfirmasi dua langkah).
- Editor per frasa: **Sumber**, **Romanisasi**, **Bahasa Indonesia** (adaptasi terpilih), catatan jeda/nada panjang.
- **Impor audio lokal** (IndexedDB, tidak pernah diunggah; batas 100 MB) + putar/jeda/seek/durasi.
- **Timestamp manual** (`m:ss.d` atau ambil posisi pemutar) dan **overlay** yang menyorot frasa aktif mengikuti audio.
- **Tiga kandidat per frasa** (A meaning-first / B balanced / C singability-first) + tombol "Gunakan".
- **Estimasi suku kata otomatis** yang dapat dikoreksi; **heuristik kepadatan** berlabel estimasi; **skor manual** 5 dimensi + total berbobot (hipotesis); tabel perbandingan.
- **Integrasi AI (BYO):** konfigurasi sendiri di tab Pengaturan; kunci hanya lokal; audio tidak pernah dikirim; kandidat AI mengisi slot kosong tanpa menimpa tulisan Anda, terlacak per model.
- **Analisis jeda (estimasi, 100% lokal):** deteksi segmen suara & jeda antar frasa berbasis energi (Web Audio API, tanpa dependensi); klik jeda untuk mendengarkan dari awalnya; hasil berlabel estimasi — koreksi manual tetap sumber utama.
- **Ekspor**: salin lirik, unduh backup JSON, dan **unduh catatan eksperimen (.md)**.
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

## Batasan (Fase 6)

- Analisis jeda **adalah estimasi berbasis energi** — bagian pelan pada musik nyata bisa salah terdeteksi sebagai jeda; akurasi terukur hanya pada sinyal sintetis (< 100 ms); akurasi lagu nyata menunggu anotasi manual (EXP-0001).
- Separasi vokal, pitch tracking, alignment suku kata, dan estimasi tempo penuh **sengaja ditunda** (alasan: model besar/lisensi/performa; lihat ROADMAP Phase 6).
- Uji ke penyedia AI nyata belum dilakukan (menunggu kunci pengguna); jalur 401 teruji via server lokal.
- Ambang heuristik (risiko kepadatan, bobot skor) masih hipotesis menunggu kalibrasi.
- Tidak ada undo/redo atau ikon ekstensi; E2E memakai Chromium — muat manual di Chrome branded dianjurkan.

## Privasi

Fase 1 tidak mengirimkan data apa pun ke layanan eksternal; satu-satunya izin adalah `sidePanel`. Audio dan lirik pribadi tidak pernah masuk git (`local/` dan `*.mp3` di `.gitignore`).
