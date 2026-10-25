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

## Mode lokal gratis (Ollama — tanpa API key)

Kandidat AI bisa dibuat **gratis dan offline** memakai Ollama di komputer sendiri:

1. **Pasang Ollama** — unduh dari [ollama.com](https://ollama.com) (Windows/macOS/Linux). Setelah terpasang, server berjalan otomatis di `http://localhost:11434`.
2. **Unduh model** — di terminal: `ollama pull llama3.1:8b` (±4,9 GB; lebih ringan: `llama3.2:3b` dengan kualitas lebih rendah; `qwen2.5:7b` juga kuat untuk bahasa Indonesia).
3. **Izinkan ekstensi (CORS) — gunakan yang paling sempit dulu:**
   - Salin ID ekstensi Anda dari `chrome://extensions` (kartu LyraSync AI, 32 huruf).
   - Windows (PowerShell, lalu **keluar dari tray & jalankan ulang Ollama**):
     `setx OLLAMA_ORIGINS "chrome-extension://ID-ANDA"`
   - Fallback hanya bila ID sering berubah (mode unpacked): `setx OLLAMA_ORIGINS "chrome-extension://*"` — lebih longgar karena mengizinkan semua ekstensi; hindari `*` polos (mengizinkan semua situs).
   - macOS/Linux: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://ID-ANDA"` (macOS) atau `Environment=` di unit service (Linux), lalu restart Ollama.
4. **Di LyraSync AI** — tab Pengaturan → klik **"Preset Ollama lokal (gratis, tanpa kunci)"** → sesuaikan nama model dengan yang Anda pull → **Simpan** → kunci dibiarkan kosong.
5. **Uji** — tab Editor → "Buat kandidat (AI)". Semua data tetap di komputer Anda.

**Spek komputer (model 7–8B Q4):** disk ±5 GB per model; RAM total ≥ 8 GB (16 GB nyaman); CPU modern bisa jalan tapi lambat (satu permintaan bisa 1–2 menit — batas waktu klien sudah 120 detik); GPU VRAM ≥ 6 GB atau Apple Silicon jauh lebih cepat.

**Batasan jujur:** kualitas kandidat model lokal 7–8B tidak setara model cloud besar dan bervariasi antar model; jalur Ollama **asli** diuji di mesin pengguna — pada CI kami diuji lewat server tiruan bergaya Ollama (E2E #9, respons identik formatnya).

## Rilis & rollback

- Rilis beta saat ini: tag **`v0.1.0-beta.1`** (pra-rilis — bukan klaim siap produksi; lihat Known issues).
- **Reproduksi rilis** dari tag mana pun: `git checkout <tag> && npm ci && npm run verify && npm run build` → hasil di `dist/`.
- **Rollback**: `git checkout v0.1.0-beta.1` (atau tag sebelumnya), lalu build ulang. Riwayat lengkap ada di `REVISION_LOG.md`.

## Known issues (per v0.1.0-beta.1)

1. **EXP-0001 belum dijalankan** — metode adaptasi belum divalidasi dengan data nyata; ambang heuristik & bobot skor masih hipotesis.
2. **Uji AI ke penyedia nyata belum dilakukan** (butuh kunci pengguna); jalur sukses terverifikasi lewat mock, jalur 401 via server uji lokal.
3. Tidak ada mode AI tanpa kunci: minimal perlu Base URL + kunci + model (Ollama lokal gratis tapi tetap isi placeholder di kolom kunci + atur `OLLAMA_ORIGINS`).
4. Akurasi analisis jeda terukur hanya pada sinyal sintetis (< 100 ms); musik nyata bisa salah deteksi (bagian pelan ≠ jeda).
5. Muat manual di Chrome branded belum diverifikasi pengguna (E2E memakai Chromium).
6. Verifikasi visual baris panjang dan skenario penyimpanan penuh belum diuji.
7. Tidak ada undo/redo; ikon ekstensi masih default.

## Privasi & keamanan

- Izin ekstensi minimal: `sidePanel` + `storage`; **tanpa host_permissions** (diaudit 2026-10-25).
- Satu-satunya panggilan jaringan: klien AI (`src/shared/ai/client.ts`) — hanya **teks** konteks frasa, hanya saat Anda menekan "Buat kandidat (AI)"; **audio tidak pernah dikirim**.
- Kunci API hanya di `chrome.storage.local` perangkat Anda; tidak ada rahasia di repo (diaudit, `npm audit` 0 kerentanan); kepatuhan terhadap ketentuan layanan penyedia AI menjadi tanggung jawab pengguna.
- Lirik & proyek tersimpan lokal (IndexedDB); lirik berhak cipta tidak pernah masuk Git (`local/` dan media di-ignore).
