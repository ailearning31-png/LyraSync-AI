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
**Status:** Not started

Tasks:
- [ ] Decide model/provider and privacy requirements.
- [ ] Define structured output for candidate lyrics and rationale.
- [ ] Add error handling, rate limits, and user controls.
- [ ] Keep credentials out of extension source.
- [ ] Test outputs against manually evaluated examples.

Acceptance criteria:
- Output is editable and traceable.
- Errors are recoverable.
- Evaluation results are recorded rather than assumed.

## Phase 6 — Advanced audio analysis
**Status:** Not started; optional

Potential tasks:
- [ ] Estimate beat/onset and phrase boundaries.
- [ ] Explore vocal separation and pitch tracking.
- [ ] Explore syllable/phoneme alignment.
- [ ] Compare estimates against manual annotations.
- [ ] Keep manual correction available.

Acceptance criteria:
- Accuracy is measured on representative examples.
- Uncertain estimates are labeled.
- Performance and licensing implications are documented.

## Phase 7 — Regression, release, and ongoing maintenance
**Status:** Not started

Tasks:
- [ ] Run the complete applicable test checklist.
- [ ] Review privacy, permissions, and external-service terms.
- [ ] Document installation and known limitations.
- [ ] Tag a stable version in Git.
- [ ] Update docs for every release.
- [ ] Review dependency/security updates deliberately, not blindly.

Acceptance criteria:
- Release can be reproduced.
- Known issues are documented.
- Rollback to the last stable version is possible.

## Next action
1. Review Phase 1–4 secara manual di Chrome: load `dist/`, impor audio, tulis kandidat A/B/C, bandingkan, ekspor eksperimen.
2. **Jalankan EXP-0001** (worksheet siap) — data nyata kini juga jadi bahan kalibrasi ambang heuristik 1,25/0,7 dan bobot skor.
3. Phase 5 (integrasi AI) membutuhkan keputusan pengguna: penyedia model, privasi, dan cara kredensial (backend vs konfigurasi pengguna) — jangan pakai kunci privat di kode ekstensi. Do not begin advanced audio analysis before the overlay and phrase-level workflow have demonstrated value.
