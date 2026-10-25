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
**Status:** Not started

Tasks:
- [ ] Import permitted local audio.
- [ ] Add playback, seeking, and duration display.
- [ ] Create manually editable phrase timestamps.
- [ ] Show synchronized source/romanized/Indonesian text.
- [ ] Test seeking and phrase switching.

Acceptance criteria:
- Overlay timing follows audio seeking reliably in test cases.
- Manual correction is possible.
- Audio and text remain local unless explicit integration is enabled.

## Phase 4 — Candidate evaluation helpers
**Status:** Not started

Tasks:
- [ ] Add editable syllable estimates.
- [ ] Add phrase-length and crowding heuristics.
- [ ] Add manual scores and notes.
- [ ] Label all heuristic results as estimates.
- [ ] Preserve a way to override automated suggestions.

Acceptance criteria:
- User can compare candidates side by side.
- Heuristics do not claim to prove melodic fit.
- At least one documented experiment can be recorded in-app or exported.

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
1. Review Phase 1–2: muat `dist/` manual di Chrome (chrome://extensions → Developer mode → Load unpacked), buat proyek, tulis beberapa frasa, tutup-buka panel, pastikan data bertahan.
2. Jalankan EXP-0001 saat memungkinkan (worksheet siap) — datanya tetap dibutuhkan untuk kalibrasi heuristik.
3. Setelah review: mulai Phase 3 (impor & pemutaran audio lokal + timestamp frasa + overlay). Do not begin advanced audio analysis before the overlay and phrase-level workflow have demonstrated value.
