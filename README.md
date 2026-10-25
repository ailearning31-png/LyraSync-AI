# LyraSync AI

**Fit the Lyrics. Feel the Melody.**

Ekstensi Chrome (Manifest V3) untuk membantu mengadaptasi lirik lagu ke bahasa Indonesia yang natural dan nyaman dinyanyikan, mengikuti durasi, ritme, dan tekanan kata melodi referensi.

## Status proyek

Fase 5 — integrasi AI (konfigurasi oleh pengguna). Status fase dan kriteria kelulusan: lihat `ROADMAP.md`. Keputusan & arsitektur: `PROJECT_BRAIN.md`.

## Fitur saat ini (Fase 5)

- Membuat, membuka, mengubah judul, dan menghapus proyek (hapus dengan konfirmasi dua langkah).
- Editor per frasa: **Sumber**, **Romanisasi**, **Bahasa Indonesia** (adaptasi terpilih), catatan jeda/nada panjang.
- **Impor audio lokal** (IndexedDB, tidak pernah diunggah; batas 100 MB) + putar/jeda/seek/durasi.
- **Timestamp manual** (`m:ss.d` atau ambil posisi pemutar) dan **overlay** yang menyorot frasa aktif mengikuti audio.
- **Tiga kandidat per frasa** (A meaning-first / B balanced / C singability-first) + tombol "Gunakan" untuk menerapkan.
- **Estimasi suku kata otomatis** yang dapat dikoreksi; **heuristik kepadatan** berlabel estimasi; **skor manual** 5 dimensi + total berbobot (hipotesis); tabel perbandingan.
- **Integrasi AI (BYO):** isi sendiri Base URL + kunci API + model (endpoint kompatibel OpenAI) di tab **Pengaturan**; kunci hanya disimpan lokal (`chrome.storage.local`), tidak pernah di kode sumber; **audio tidak pernah dikirim** — hanya teks frasa saat tombol AI ditekan; kandidat AI mengisi slot kosong (tidak pernah menimpa tulisan Anda), dilabel "oleh {model}"; satu percobaan per klik, tanpa retry otomatis; pesan ramah untuk 401/429/5xx/timeout/jaringan.
- **Ekspor**: salin lirik, unduh backup JSON, dan **unduh catatan eksperimen (.md)** (termasuk jejak kandidat AI).
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

## Batasan (Fase 5)

- **Uji ke penyedia AI nyata belum dilakukan** (menunggu kunci pengguna) — jalur sukses terverifikasi lewat mock; jalur 401 lewat server uji lokal nyata.
- Estimasi suku kata & ambang risiko & bobot skor **adalah heuristik/hipotesis** — koreksi manual disediakan; kalibrasi menunggu EXP-0001.
- Tanpa izin host di manifest: penyedia cloud umum berfungsi lewat CORS; LLM lokal (Ollama) perlu `OLLAMA_ORIGINS=chrome-extension://*`.
- Tidak ada analisis audio otomatis (Fase 6, opsional), undo/redo, atau ikon ekstensi.
- E2E memakai Chromium; muat manual di Chrome branded dianjurkan (`TEST_CHECKLIST.md` bagian B).

## Privasi

Fase 1 tidak mengirimkan data apa pun ke layanan eksternal; satu-satunya izin adalah `sidePanel`. Audio dan lirik pribadi tidak pernah masuk git (`local/` dan `*.mp3` di `.gitignore`).
