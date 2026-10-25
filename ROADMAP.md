# LyraSync AI — Roadmap

Status meanings:
- **Not started:** no implementation or experiment has begun.
- **In progress:** active work is underway.
- **Blocked:** a prerequisite is missing.
- **Ready for review:** acceptance criteria appear met; verify before advancing.
- **Complete:** acceptance criteria were tested and documented.

## Phase 0 — Project setup and manual validation
**Status:** In progress / manual experiment pending

Preparation (2026-10-25): song and permitted local audio selected; repeatable procedure worksheet `EXPERIMENT_WORKSHEET_EXP-0001.md` created (anchored rubric, weighted-score hypothesis, winner rules); Git repository initialized and pushed to `github.com/ailearning31-png/LyraSync-AI`. Lyrics stay in gitignored `local/` because the repo is public.

Tasks:
- [x] Choose the first song and a permitted local audio reference. ("The Sun — Chanmina", user-owned MP3; ffprobe-verified 212.22 s)
- [ ] Select a short phrase (2–4 lines).
- [ ] Capture source lyrics and optional romanization.
- [ ] Record phrase start/end and audible pauses/held notes.
- [ ] Create three Indonesian candidates.
- [ ] Compare naturalness, meaning, syllable density, and stress.
- [ ] Test a candidate in the chosen generation workflow if appropriate.
- [ ] Record results in `EXPERIMENT_LOG.md`.
- [ ] Decide the minimum useful overlay and editor requirements.

Acceptance criteria:
- At least one phrase has a documented experiment.
- At least three candidate approaches have been compared.
- Known limitations and next steps are written down.
- No coding is required to declare the manual method validated.

## Phase 1 — Minimal extension shell
**Status:** Ready for review (2026-10-25)

Tasks:
- [x] Confirm the development environment and preferred stack. (Node 24.16 + npm 11.13; Vite 8 + React 19 + TypeScript 6 — build green)
- [x] Create a Manifest V3 extension with side panel. (`public/manifest.json`: side_panel + izin sidePanel; Chromium ≥ 114)
- [x] Add basic project shell and navigation. (3 tab placeholder berbahasa Indonesia, error banner, footer versi)
- [x] Add basic automated checks/build script. (`npm run verify` = build + tsc + ESLint + Vitest + Playwright)
- [x] Load unpacked extension in Chrome and verify startup. (E2E otomatis Chromium PASS; muat manual di Chrome branded menunggu verifikasi pengguna)

Acceptance criteria:
- Extension builds and loads without fatal errors. → build ✓; dimuat di Chromium E2E tanpa console/page error ✓
- A minimal automated/manual smoke test is documented. → `e2e/extension.spec.ts` + README
- Git repository and version checkpoint exist. → REV-0002/REV-0003

## Phase 2 — Manual lyric editor and project persistence
**Status:** Ready for review (2026-10-25)

Tasks:
- [x] Create/edit projects and phrases. (buat dari daftar, hapus dengan konfirmasi dua langkah, judul dapat diubah; tambah/hapus frasa per proyek)
- [x] Enter source, romanized, and Indonesian text separately. (tiga textarea independen per frasa)
- [x] Save and reopen projects locally. (IndexedDB; autosave debounce 400 ms + flush saat pindah tab atau panel disembunyikan; indikator status tersimpan/gagal)
- [x] Add export/copy and basic validation. (salin lirik berformat seksi, unduh JSON, judul kosong ditolak, record korup dilewati tanpa menggagalkan daftar)

Acceptance criteria:
- Core editing workflow survives closing/reopening. → E2E Chromium: buat → edit → autosave → tutup halaman panel → buka ulang → ketiga teks utuh ✓
- Text fields remain independent. → E2E meng-assert ketiga kolom tetap terpisah saat diedit ✓
- Regression checklist passes. → `npm run verify` exit 0: build + tsc + ESLint + 20 unit test + 3 E2E ✓

## Phase 3 — Local audio playback and overlay timeline
**Status:** Ready for review (2026-10-25)

Tasks:
- [x] Import permitted local audio. (file picker `audio/*`; bytes disimpan di store IndexedDB 'audio' — lokal murni; batas 100 MB dengan pesan jelas; nama+durasi tercatat di proyek)
- [x] Add playback, seeking, and duration display. (satu elemen Audio; putar/jeda, slider seek, tampilan m:ss.d / durasi)
- [x] Create manually editable phrase timestamps. (input m:ss.d per frasa dengan validasi parse, tombol "Set mulai/akhir" dari posisi pemutar, kolom catatan bebas)
- [x] Show synchronized source/romanized/Indonesian text. (overlay: Sumber+Romanisasi+Indonesia per baris; frasa aktif disorot `aria-current` + auto-scroll; klik baris melompat ke waktunya)
- [x] Test seeking and phrase switching. (E2E: seek 1.0 dtk → frasa aktif; seek 2.5 dtk → nonaktif; klik baris overlay → posisi pemutar pindah)

Acceptance criteria:
- Overlay timing follows audio seeking reliably in test cases. → E2E Chromium PASS (aktif di dalam rentang 0.5–2.0 dtk, nonaktif di 2.5 dtk) ✓
- Manual correction is possible. → ketik waktu manual (invalid dikembalikan aman) + ambil posisi pemutar + catatan ✓
- Audio and text remain local unless explicit integration is enabled. → audio & teks hanya IndexedDB lokal; tidak ada kode jaringan; izin manifest tetap hanya `sidePanel` ✓

## Phase 4 — Candidate evaluation helpers
**Status:** Ready for review (2026-10-25)

Tasks:
- [x] Add editable syllable estimates. (estimasi otomatis: kelompok vokal Indonesia — hiatus di tengah kata dihitung terpisah, diftong ai/au/oi hanya di akhir kata; kana Jepang = 1 mora; kanji ditandai "tidak pasti"; koreksi manual menang + tombol kembali ke estimasi)
- [x] Add phrase-length and crowding heuristics. (kepadatan suku kata/dtk kandidat vs sumber dari durasi frasa; chip risiko padat/renggang/setara dengan ambang hipotesis 1,25/0,7; tanpa durasi → "belum cukup data")
- [x] Add manual scores and notes. (3 kandidat per frasa (A meaning-first/B balanced/C singability-first), skor manual 1–5 untuk 5 dimensi, catatan per frasa & per kandidat, tombol "Gunakan" menyalin kandidat ke adaptasi terpilih)
- [x] Label all heuristic results as estimates. (semua chip diberi akhiran "(estimasi)", total berbobot dilabel "(hipotesis 30/20/20/20/10)", caption tabel: bukan bukti kecocokan melodi)
- [x] Preserve a way to override automated suggestions. (koreksi suku kata manual tersimpan dan dipakai di semua perhitungan; skor hanya dari pengguna)

Acceptance criteria:
- User can compare candidates side by side. → tabel perbandingan per frasa (kolom A/B/C: teks, suku kata, kepadatan, risiko, 5 skor, total, catatan) — E2E Chromium ✓
- Heuristics do not claim to prove melodic fit. → label estimasi/hipotesis di seluruh UI + unit test memastikan total null saat data kurang ✓
- At least one documented experiment can be recorded in-app or exported. → "Unduh eksperimen" menghasilkan Markdown lengkap per template log (E2E memverifikasi isi file yang benar-benar diunduh) ✓

## Phase 5 — AI adaptation integration
**Status:** Ready for review (2026-10-25) — uji ke penyedia AI nyata menunggu kunci pengguna

Tasks:
- [x] Decide model/provider and privacy requirements. (KEPUTUSAN: agnostik penyedia — konfigurasi BYO pengguna di tab Pengaturan, endpoint kompatibel OpenAI; kunci hanya di `chrome.storage.local` perangkat, tidak pernah di kode; audio tidak pernah dikirim, hanya teks saat tombol AI ditekan)
- [x] Define structured output for candidate lyrics and rationale. (skrip prompt meminta JSON `{candidates:[{slot,text,rationale}]}`; parser memvalidasi bentuk — output tidak valid ditolak, bukan disimpan)
- [x] Add error handling, rate limits, and user controls. (timeout AbortController 30 dtk; pesan ramah 401/403/429/5xx/jaringan/CORS; SATU percobaan per klik — tanpa retry otomatis; tombol "Hapus konfigurasi")
- [x] Keep credentials out of extension source. (kunci hanya via UI Pengaturan → storage lokal; unit test memastikan pesan error tidak membocorkan kunci)
- [x] Test outputs against manually evaluated examples. (dengan mock fetch: sukses, code fence, 401/429/5xx/timeout/jaringan, JSON rusak — 74 unit test; uji ke layanan NYATA: BLOCKED menunggu kunci pengguna — jalur 401 diuji end-to-end dengan server lokal sungguhan)

Acceptance criteria:
- Output is editable and traceable. → kandidat AI mengisi slot kosong (tidak pernah menimpa tulisan pengguna), dilabel "oleh {model}" + rationale di catatan, ikut terekam di ekspor eksperimen ✓
- Errors are recoverable. → E2E: gagal 401/belum dikonfigurasi → pesan jelas, teks pengguna utuh, tanpa kehilangan data ✓
- Evaluation results are recorded rather than assumed. → kandidat AI lewat alur penilaian manual yang sama (skor/pengguna/ekspor) ✓

## Phase 6 — Advanced audio analysis
**Status:** Fitur OPSIONAL — MVP energi selesai & teruji; analisis lanjutan DITUNDA sampai workflow utama terbukti bermanfaat (lihat keputusan eksplorasi di bawah)

Tasks:
- [x] Estimate beat/onset and phrase boundaries. (onset = awal segmen suara; batas frasa disarankan dari jeda ≥ 0,25 dtk berbasis envelope RMS 50 ms/25 ms — sederhana & dapat dijelaskan; estimasi tempo/beat penuh DITUNDA sampai data EXP-0001 menunjukkan kebutuhan)
- [x] Explore vocal separation and pitch tracking. (DIEKSPLORASI → DITUNDA dengan alasan terdokumentasi: butuh model ML besar / implikasi lisensi & performa; workflow manual + analisis energi belum menunjukkan kebutuhan)
- [x] Explore syllable/phoneme alignment. (DIEKSPLORASI → DITUNDA: forced alignment butuh model terpisah; koreksi manual + tombol Set dari pemutar sudah cukup cepat untuk MVP)
- [x] Compare estimates against manual annotations. (akurasi diukur terhadap sinyal sintetis berbatas diketahui: galat batas < 100 ms — unit test; lagu nyata BELUM diukur, terbuka untuk EXP-0001+)
- [x] Keep manual correction available. (semua saran hanya tampilan; klik jeda → seek untuk verifikasi telinga; timestamp tetap milik pengguna)

Acceptance criteria:
- Accuracy is measured on representative examples. → sinyal sintetis 3 segmen: 3/3 segmen & 2/2 jeda terdeteksi, galat < 100 ms (unit test). Catatan jujur: akurasi pada musik nyata belum diukur.
- Uncertain estimates are labeled. → panel berlabel "estimasi otomatis berbasis energi" + peringatan bagian pelan ≠ jeda.
- Performance and licensing implications are documented. → 100% lokal via Web Audio API (tanpa lisensi/tanpa jaringan); decode via OfflineAudioContext (andalkan di headless); komputasi O(n) sesuai permintaan; Essentia.js sengaja dihindari (ukuran/lisensi).

## Phase 7 — Regression, release, and ongoing maintenance
**Status:** Ready for review — beta audit 2026-10-25 (rilis penuh menunggu EXP-0001)

Tasks:
- [x] Run the complete applicable test checklist. (`npm run verify` exit 0: build+tsc+ESLint+80 unit+8 E2E; `npm audit` 0 kerentanan; checklist bagian A–G tercentang dengan bukti di `TEST_CHECKLIST.md`)
- [x] Review privacy, permissions, and external-service terms. (izin minimal `sidePanel`+`storage`, TANPA host_permissions; satu titik jaringan: `src/shared/ai/client.ts:80`, hanya teks, hanya saat tombol AI ditekan; audio/lyrics lokal; tanpa rahasia di repo — grep audit + tanpa .env; kepatuhan ToS penyedia AI menjadi tanggung jawab pengguna — tercatat di README)
- [x] Document installation and known limitations. (README: instalasi, penggunaan, batasan, known issues, rilis & rollback)
- [x] Tag a stable version in Git. (`v0.1.0-beta.1` — tag pra-rilis; BUKAN klaim siap produksi karena EXP-0001 dan uji AI nyata masih terbuka)
- [x] Update docs for every release. (dokumen diperbarui pada setiap fase; entri REV-0009 mencatat rilis beta)
- [x] Review dependency/security updates deliberately, not blindly. (npm audit 0; versi terkunci di package-lock; kebijakan: tinjau manual sebelum upgrade, tidak ada auto-update)

Acceptance criteria:
- Release can be reproduced. → dari tag: `npm ci && npm run verify && npm run build` (terdokumentasi di README)
- Known issues are documented. → README bagian "Known issues"
- Rollback to the last stable version is possible. → tag Git + instruksi checkout di README

## Next action
1. **Pengguna jalankan EXP-0001** (worksheet + langkah siap; lihat `EXPERIMENT_LOG.md` EXP-0001): satu frasa pendek, konfigurasi AI pribadi, nyanyikan kandidat, catat hasil.
2. Setelah data EXP-0001 masuk: kalibrasi ambang heuristik & bobot skor, evaluasi kebutuhan analisis lanjutan (Phase 6 lanjutan tetap ditunda).
3. Kriteria rilis penuh (bukan beta): EXP-0001 tervalidasi + uji AI penyedia nyata + review manual Chrome branded.
