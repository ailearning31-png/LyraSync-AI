# LyraSync AI — Test Checklist

Check only tests that were actually performed. Add test IDs and evidence as implementation grows.

## A. Documentation and project hygiene
- [x] `AGENTS.md` is read before code changes. (2026-10-25: full doc inspection performed before any change)
- [x] Current Git status is inspected before editing. (not-a-repo state found first; `status --porcelain` reviewed before each commit)
- [x] No uncommitted user changes were overwritten. (only new files added; user MP3 untouched)
- [x] Revision log updated after meaningful change. (REV-0002)
- [x] Roadmap updated after phase/status changes. (Phase 0 preparation note + task 1)
- [x] No secrets or credentials were committed. (staged-file review before each commit: only `.md` + `.gitignore`)

## B. Extension startup and packaging
- [x] Extension builds without errors. (2026-10-25: `npm run build`, Vite 8, output dist/ dengan nama stabil)
- [x] Manifest V3 manifest validates. (unit test `src/shared/manifest.test.ts` + dimuat di Chromium E2E)
- [x] Extension loads in Chrome without fatal errors. (Chromium penuh via Playwright E2E — zero console/page error; muat manual di Chrome branded masih menunggu verifikasi pengguna)
- [ ] Side panel opens and closes correctly. (halaman panel terverifikasi dirender di E2E; buka/tutup via ikon toolbar belum diuji manual)
- [x] No unexpected console errors during the core workflow. (E2E meng-assert nol console.error + pageerror)
- [ ] Missing permissions or unavailable APIs are handled gracefully. (NOT RUN — skenario izin hilang belum diuji)

## C. Audio import and playback
- [ ] A supported local audio file can be selected.
- [ ] Unsupported/corrupt file produces a clear error.
- [ ] Play, pause, seek, and duration display work.
- [ ] Repeated play/pause does not create duplicate playback.
- [ ] Large files fail gracefully if resource limits are reached.
- [ ] Audio is not uploaded externally unless clearly disclosed and authorized.

## D. Lyrics and overlay
- [x] Source lyric can be entered and edited. (2026-10-25: E2E Chromium mengisi kolom Sumber)
- [x] Romanized text is optional and independently editable. (E2E: kolom Romanisasi terpisah dan bisa kosong)
- [x] Indonesian candidates can be edited without altering the source text. (E2E meng-assert nilai Sumber tetap utuh setelah mengedit kolom lain)
- [ ] Phrase timestamps can be created and corrected manually. (Phase 3 — belum ada fitur timing)
- [ ] Overlay remains synchronized when seeking and changing phrases. (Phase 3)
- [ ] Long lines wrap without hiding controls. (CSS overflow-wrap dipakai; verifikasi visual manual pending)
- [x] Empty and malformed text inputs are handled. (frasa boleh kosong; judul kosong ditolak dengan pesan; unit test validasi)
- [ ] Text timing is not inferred solely from character count. (berlaku mulai Phase 3 saat ada timing)

## E. Candidate adaptation and scoring
- [ ] Candidate variants are clearly labeled.
- [ ] User can edit and compare candidates.
- [ ] Syllable estimates can be corrected manually.
- [ ] Score explanations are visible.
- [ ] Unverified heuristic scores are labeled as estimates.
- [ ] Held vowels and melisma are not automatically treated as errors.
- [ ] User can approve, reject, or regenerate an individual phrase.
- [ ] Meaning drift and naturalness can be recorded separately from rhythm.

## F. Persistence and recovery
- [x] Project can be saved. (2026-10-25: autosave + tombol Simpan sekarang; unit test repo IndexedDB via fake-indexeddb)
- [x] Saved project can be reopened. (E2E Chromium)
- [x] Closing and reopening the extension preserves expected data. (E2E: halaman panel ditutup lalu dibuka ulang pada profil yang sama — ketiga teks utuh)
- [x] Missing/corrupt saved data produces a recoverable error. (unit test: record korup dilewati, proyek sehat tetap tampil; getProject korup → null)
- [x] Export/copy works with Unicode and Indonesian characters. (unit test buildExportText; clipboard manual pending)
- [ ] Undo/redo is tested if implemented. (n/a — belum diimplementasi)

## G. AI/API integration (only if implemented)
- [ ] API credentials are not embedded in distributable extension code.
- [ ] Network errors and rate limits are handled.
- [ ] User is informed before audio/text is sent to an external service.
- [ ] Model output is validated before being stored.
- [ ] Retry logic cannot create runaway repeated requests.
- [ ] Sensitive content is not written to logs.

## H. Regression protocol
For every bug fix:
- [ ] Reproduce the old bug before fixing, when possible.
- [ ] Add a regression test or a repeatable manual test.
- [ ] Run the relevant feature tests.
- [ ] Run tests for neighboring features that could be affected.
- [ ] Compare behavior against the previous stable version.
- [ ] Record exact pass/fail results in `REVISION_LOG.md`.
- [ ] If tests are blocked, record the reason and do not claim verified success.

## Current test status
2026-10-25 — Phase 0: seksi A verified. Phase 1: build, typecheck, lint, unit test, E2E smoke Chromium PASS. Phase 2: `npm run verify` exit 0 — build + tsc + ESLint + **20 unit test** (repo IndexedDB via fake-indexeddb, validasi, ekspor, manifest) + **3 E2E Chromium** (smoke, persistensi lintas buka-tutup panel, hapus dua langkah). Pending: muat manual di Chrome branded, buka/tutup panel via toolbar, verifikasi visual baris panjang, seksi C/E/G/H (fiturnya belum ada atau belum diuji manual).
