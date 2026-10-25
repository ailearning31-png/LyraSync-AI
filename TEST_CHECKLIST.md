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
- [x] A supported local audio file can be selected. (2026-10-25: E2E Chromium mengimpor WAV sintetis; nama+durasi tampil)
- [x] Unsupported/corrupt file produces a clear error. (E2E: file teks berekstensi .wav → pesan "Audio tidak dapat diputar")
- [x] Play, pause, seek, and duration display work. (E2E: toggle Putar↔Jeda, slider seek, tampilan m:ss.d / durasi)
- [x] Repeated play/pause does not create duplicate playback. (arsitektur satu elemen Audio per editor; E2E menguji toggle berulang)
- [ ] Large files fail gracefully if resource limits are reached. (batas 100 MB diprogram dengan pesan; skenario penyimpanan penuh belum diuji)
- [x] Audio is not uploaded externally unless clearly disclosed and authorized. (bytes hanya masuk IndexedDB lokal; audit kode: tidak ada fetch/XHR; izin manifest hanya sidePanel)

## D. Lyrics and overlay
- [x] Source lyric can be entered and edited. (2026-10-25: E2E Chromium mengisi kolom Sumber)
- [x] Romanized text is optional and independently editable. (E2E: kolom Romanisasi terpisah dan bisa kosong)
- [x] Indonesian candidates can be edited without altering the source text. (E2E meng-assert nilai Sumber tetap utuh setelah mengedit kolom lain)
- [x] Phrase timestamps can be created and corrected manually. (input m:ss.d per frasa + tombol Set dari pemutar; E2E Chromium)
- [x] Overlay remains synchronized when seeking and changing phrases. (E2E: aktif di dalam rentang, nonaktif di luar; klik baris overlay melompat ke waktunya)
- [ ] Long lines wrap without hiding controls. (CSS overflow-wrap dipakai; verifikasi visual manual pending)
- [x] Empty and malformed text inputs are handled. (frasa boleh kosong; judul kosong ditolak; input waktu invalid dikembalikan ke nilai semula — unit + E2E)
- [x] Text timing is not inferred solely from character count. (waktu hanya berasal dari entri manual/posisi pemutar; tidak ada estimasi otomatis di kode)

## E. Candidate adaptation and scoring
- [x] Candidate variants are clearly labeled. (2026-10-25: slot A/B/C dengan nama pendekatan; E2E Chromium)
- [x] User can edit and compare candidates. (editor per kandidat + tabel perbandingan berdampingan; E2E)
- [x] Syllable estimates can be corrected manually. (koreksi manual mengubah kepadatan & risiko — E2E; tombol Pakai estimasi mengembalikan)
- [x] Score explanations are visible. (label 5 dimensi + bobot ditampilkan + total berbobot dengan label hipotesis)
- [x] Unverified heuristic scores are labeled as estimates. (chip "(estimasi)", total "(hipotesis)", caption tabel; unit test: total null bila data kurang — tanpa presisi palsu)
- [x] Held vowels and melisma are not automatically treated as errors. (tidak ada flag otomatis; catatan bebas; indikator renggang hanyalah estimasi)
- [x] User can approve, reject, or regenerate an individual phrase. (Gunakan = terima, Hapus kandidat = tolak, tulis ulang manual; regenerasi otomatis menyusul di Fase 5 — AI)
- [x] Meaning drift and naturalness can be recorded separately from rhythm. (skor terpisah per dimensi + catatan kandidat)

## F. Persistence and recovery
- [x] Project can be saved. (2026-10-25: autosave + tombol Simpan sekarang; unit test repo IndexedDB via fake-indexeddb)
- [x] Saved project can be reopened. (E2E Chromium)
- [x] Closing and reopening the extension preserves expected data. (E2E: halaman panel ditutup lalu dibuka ulang pada profil yang sama — ketiga teks utuh)
- [x] Missing/corrupt saved data produces a recoverable error. (unit test: record korup dilewati, proyek sehat tetap tampil; getProject korup → null)
- [x] Export/copy works with Unicode and Indonesian characters. (unit test buildExportText; clipboard manual pending)
- [ ] Undo/redo is tested if implemented. (n/a — belum diimplementasi)

## G. AI/API integration (only if implemented)
- [x] API credentials are not embedded in distributable extension code. (2026-10-25: kunci hanya via UI Pengaturan → `chrome.storage.local`; unit test memastikan pesan error bebas kunci; audit source: tidak ada kunci)
- [x] Network errors and rate limits are handled. (unit test 401/403/429/5xx/timeout/jaringan; E2E 401 dari server lokal nyata → pesan jelas)
- [x] User is informed before audio/text is sent to an external service. (panel privasi di tab Pengaturan + tooltip tombol AI; audio tidak pernah dikirim — hanya teks konteks frasa)
- [x] Model output is validated before being stored. (parser + validator: slot/slot-teks wajib; JSON rusak ditolak — unit test)
- [x] Retry logic cannot create runaway repeated requests. (satu percobaan per klik, tanpa retry otomatis — by design; tombol dinonaktifkan saat proses berjalan)
- [x] Sensitive content is not written to logs. (client tidak mencatat body/kunci; pesan error bebas kunci — unit test)

## H. Regression protocol
For every bug fix:
- [x] Reproduce the old bug before fixing, when possible. (2026-10-25: REV-0003–REV-0008 — setiap defect direproduksi via tes yang gagal sebelum diperbaiki)
- [x] Add a regression test or a repeatable manual test. (setiap perbaikan disertai/tercakup unit atau E2E; suite 8 E2E + 80 unit dapat diulang via `npm run verify`)
- [x] Run the relevant feature tests. (setiap REV mencatat rerun)
- [x] Run tests for neighboring features that could be affected. (verify penuh dijalankan tiap fase)
- [x] Compare behavior against the previous stable version. (E2E fase sebelumnya tetap lulus setelah tiap perubahan skema)
- [x] Record exact pass/fail results in `REVISION_LOG.md`. (REV-0002 s.d. REV-0009)
- [x] If tests are blocked, record the reason and do not claim verified success. (uji AI nyata & EXP-0001 tercatat BLOCKED/belum diuji — tidak pernah diklaim lulus)

## Current test status
2026-10-25 — **Audit Phase 7 (REV-0009) + mode lokal Ollama (REV-0010)**: `npm run verify` exit 0 (build+tsc+ESLint+**81 unit**+**9 E2E Chromium** — termasuk jalur AI lokal TANPA kunci via server tiruan bergaya Ollama), `npm audit` 0 kerentanan, grep rahasia bersih, izin minimal tanpa host_permissions, satu titik jaringan (klien AI). Tag **v0.1.0-beta.1**. **Belum diuji / BLOCKED:** Ollama ASLI di mesin pengguna, EXP-0001, uji AI penyedia cloud nyata (kunci), muat manual Chrome branded, verifikasi visual, skenario penyimpanan penuh, akurasi analisis di lagu nyata.
