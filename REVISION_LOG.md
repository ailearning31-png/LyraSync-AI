# LyraSync AI — Revision Log

Use one entry per bug fix, implementation change, or meaningful revision. Keep old entries; append new ones instead of rewriting history.

## Entry template

### REV-YYYYMMDD-NN — Short title
- **Date:**
- **Status:** Proposed / In progress / Verified / Reverted / Blocked
- **Reported behavior:**
- **Steps to reproduce:**
- **Expected behavior:**
- **Actual behavior:**
- **Root cause:** Verified / Hypothesis / Unknown
- **Fix or change:**
- **Files changed:**
- **Tests run:**
- **Test results:**
- **Regression checks:**
- **Known side effects / risks:**
- **Related entries:**
- **Follow-up:**

---

## Initial record

### REV-0001 — Establish project memory and revision discipline
- **Date:** 2026-10-25
- **Status:** Specified; implementation not started
- **Reported behavior:** Risk of repeating previous revisions and losing project decisions during future AI-assisted development.
- **Expected behavior:** Every coding agent reads project context, checks prior fixes, tests changes, and updates documentation.
- **Actual behavior:** Process is defined in this documentation package; no extension code has been built or tested yet.
- **Root cause:** No repository-level memory and revision workflow existed yet.
- **Fix or change:** Added `AGENTS.md`, `PROJECT_BRAIN.md`, `ROADMAP.md`, `TEST_CHECKLIST.md`, and `EXPERIMENT_LOG.md`.
- **Files changed:** Documentation package only.
- **Tests run:** Not applicable; no application code.
- **Test results:** Documentation created; not an application verification.
- **Regression checks:** Not applicable yet.
- **Known side effects / risks:** Documentation only prevents repetition if the agent follows it. Git history and executable tests are still required.
- **Follow-up:** Put these files in the project root and require the coding agent to read `AGENTS.md` first.

---

## 2026-10-25 — Phase 0 preparation

### REV-0002 — Git checkpoint, public-repo safeguards, and EXP-0001 worksheet
- **Date:** 2026-10-25
- **Status:** Verified
- **Reported behavior:** Not a bug — setup task. Repository was documentation-only: no version control, no repeatable experiment procedure, Phase 0 blocked on an unprepared manual experiment.
- **Steps to reproduce:** `git status` returned "not a git repository"; `EXPERIMENT_LOG.md` EXP-0001 had `Result: Not run` with no executable procedure.
- **Expected behavior:** Version checkpoint exists (also a Phase 1 acceptance criterion); the manual experiment is repeatable and executable by the user; copyrighted material cannot leak into the public GitHub repository.
- **Actual behavior:** Git repository initialized on `main` with repo-local identity; two commits (`1d3f775` docs checkpoint, `19913a5` worksheet) pushed to `https://github.com/ailearning31-png/LyraSync-AI.git`; experiment worksheet plus gitignored `local/` answer sheet created; five project docs updated.
- **Root cause:** Verified — starter package predates any tooling setup; nothing had been initialized.
- **Fix or change:** `git init -b main`; repo-local identity `ailearning31-png` + GitHub noreply email (ID 292332812); `.gitignore` blocking media/`local/`/`.zcode`/secrets; `EXPERIMENT_WORKSHEET_EXP-0001.md` (procedure, anchored 1–5 rubric, weighted-score hypothesis 30/20/20/20/10 labeled as hypothesis, winner rules with meaning-disqualification); `local/README.md` + `local/EXP-0001-ISIAN.md` for copyrighted lyrics; doc updates across `EXPERIMENT_LOG.md`, `PROJECT_BRAIN.md`, `ROADMAP.md`, `TEST_CHECKLIST.md`.
- **Files changed:** `.gitignore`, `EXPERIMENT_WORKSHEET_EXP-0001.md`, `local/*` (gitignored), `EXPERIMENT_LOG.md`, `PROJECT_BRAIN.md`, `ROADMAP.md`, `TEST_CHECKLIST.md`, `REVISION_LOG.md`.
- **Tests run:** MP3 existence check (6,642,237 bytes); ffprobe metadata read; `git status --porcelain` reviewed before each commit; `git check-ignore` on `The Sun - Chanmina.mp3`, `.zcode`, and `local/*`; `git ls-remote origin main` compared with local `rev-parse main`.
- **Test results:** All passed. Staged commits contained only `.md` + `.gitignore`; mp3 and `local/` confirmed ignored; remote SHA `19913a5e…` equals local `main`. No automated tests exist yet (no application code).
- **Regression checks:** Not applicable; no application code exists to regress.
- **Known side effects / risks:** GitHub repo is PUBLIC — the committed worksheet deliberately contains no lyrics; the user must keep lyrics in `local/` only. LF→CRLF warnings from autocrlf observed (cosmetic). Git identity is repo-local, not global.
- **Related entries:** REV-0001 (its known risk "Git history … required" is now partially addressed).
- **Follow-up:** User runs EXP-0001 per the worksheet; then record results in `EXPERIMENT_LOG.md` (this log only for process fixes), evaluate Phase 0 acceptance criteria, and only then plan the Phase 1 extension scaffold.

---

## 2026-10-25 — Phase 1 implementation

### REV-0003 — Minimal extension shell (MV3 + side panel) with automated verification
- **Date:** 2026-10-25
- **Status:** Verified
- **Reported behavior:** Not a bug — implementation task (ROADMAP Phase 1). No extension code existed; user directed work to continue past the pending manual experiment.
- **Steps to reproduce:** `ls` before change — no `package.json`, no `manifest.json`, no source code.
- **Expected behavior:** MV3 extension with side panel builds and loads without fatal errors; automated checks exist; decision "manual experiments before coding" visibly superseded, not silently dropped.
- **Actual behavior:** Extension implemented and all checks green (`npm run verify` exit 0). Supersede decision recorded in `PROJECT_BRAIN.md` §7.
- **Root cause:** n/a — feature work. Two defects found and fixed during implementation (see below).
- **Fix or change:** Vite + React 19 + TypeScript scaffold with stable-name multi-entry build (`background.js`, `sidepanel.js`, copied `manifest.json` — manifest must reference stable paths); MV3 manifest with `sidePanel` permission and `openPanelOnActionClick`; minimal Indonesian UI (3 placeholder tabs, error banner from window error/unhandledrejection, version footer); `src/shared/formatDuration.ts` + unit tests; manifest structure/no-extra-permission/no-secrets tests; Playwright E2E loading unpacked extension in full Chromium; ESLint flat config; README with dev/load instructions.
- **Defect 1 (E2E timeout 60s):** root cause Verified — Playwright's default headless uses the headless shell build, which ignores `--load-extension`, so the service worker never registered. Fix: `channel: 'chromium'` (full build, new headless supports extensions). Evidence: timeout disappeared, test passes in ~1s.
- **Defect 2 (ESLint error react-hooks/set-state-in-effect in App.tsx):** root cause Verified — version state was set synchronously inside an effect (anti-pattern). Fix: lazy `useState(getExtensionVersion)` initializer; effect removed.
- **Files changed:** `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `playwright.config.ts`, `eslint.config.js`, `public/manifest.json`, `sidepanel.html`, `src/sidepanel/*`, `src/background/index.ts`, `src/shared/*`, `e2e/extension.spec.ts`, `README.md`, `.gitignore`, plus doc updates (`PROJECT_BRAIN.md`, `ROADMAP.md`, `TEST_CHECKLIST.md`, this log).
- **Tests run:** `npm run verify` (vite build → tsc --noEmit → eslint → vitest 5/5 → Playwright e2e 1/1) — exit 0, twice (second run after fixes).
- **Test results:** All PASS. Build output: `dist/{manifest.json, sidepanel.html, sidepanel.js, background.js, assets/}` with stable names. E2E asserts service worker URL, heading/tagline visibility, tab navigation, and zero console/page errors.
- **Regression checks:** Not applicable — this is the first code baseline; future changes regression-test against it.
- **Known side effects / risks:** E2E depends on `channel: 'chromium'` — headless shell cannot load extensions (documented in README and spec comment). Manual load in branded Chrome still pending user verification. Extension icons not yet created (default puzzle icon). No persistence/audio/AI yet by design.
- **Related entries:** REV-0002 (git checkpoint), PROJECT_BRAIN §7 supersede note.
- **Follow-up:** User: manual Chrome load check (TEST_CHECKLIST B) + EXP-0001 when possible. Next coding phase: Phase 2 editor + persistence.

---

## 2026-10-25 — Phase 2 implementation

### REV-0004 — Manual lyric editor and project persistence (IndexedDB)
- **Date:** 2026-10-25
- **Status:** Verified
- **Reported behavior:** Not a bug — implementation task (ROADMAP Phase 2). Editor/persistence did not exist.
- **Steps to reproduce:** Before change: only placeholder tabs; no storage.
- **Expected behavior:** Projects/phrases can be created and edited; source/romanized/Indonesian fields independent; data survives closing/reopening; export/copy and basic validation exist (Phase 2 criteria).
- **Actual behavior:** All criteria verified by automated tests (unit + Chromium E2E).
- **Root cause:** n/a — feature work. Defects found during implementation listed below.
- **Fix or change:** Data layer `src/shared/{types,validation,exportText}.ts` + `src/shared/storage/{db,projectRepo}.ts` (dependency-free IndexedDB wrapper; corrupt records skipped on read, invalid saves rejected); UI `ProjectList` (create, two-step delete, open), `ProjectEditor` (title rename, add/remove phrase, three independent textareas, copy-formatted-lyrics, download JSON, manual save), `PhraseCard`, hook `useAutoSave` (debounce 400 ms, flush on tab switch and pagehide so closing the panel does not lose the last edits); App wiring; CSS.
- **Defect 1 (TS6133):** unused `deleteProject` import in ProjectEditor — removed (deletion lives in the list view).
- **Defect 2 (ESLint react-hooks/set-state-in-effect in ProjectList):** calling a setState-bearing callback directly in an effect body. Fix: self-contained async IIFE with `cancelled` guard; list refresh via `reloadKey` state.
- **Defect 3 (ESLint react-hooks/refs in useAutoSave):** ref written during render (`latest.current = project`). Fix: mirror value in an effect, per React docs.
- **Defect 4 (unit test safeFileName):** original expectation encoded worse behavior (`Lagu__Baru_1_.json`, `_.json`). Implementation improved (collapse invalid runs to one `_`, strip edge underscores, fallback `proyek.json`) and expectations updated — documented here as a deliberate test change, not test-fudging.
- **Files changed:** `src/shared/types.ts`, `src/shared/validation.ts`, `src/shared/exportText.ts` (+test), `src/shared/storage/db.ts`, `src/shared/storage/projectRepo.ts` (+test), `src/sidepanel/hooks/useAutoSave.ts`, `src/sidepanel/components/{ProjectList,ProjectEditor,PhraseCard}.tsx`, `src/sidepanel/{App.tsx,tabs.ts,sidepanel.css}`, `e2e/extension.spec.ts`, `package.json` (+fake-indexeddb devDep), docs (`ROADMAP.md`, `TEST_CHECKLIST.md`, `PROJECT_BRAIN.md`, `README.md`, this log).
- **Tests run:** `npm run verify` → build ✓, tsc ✓, ESLint ✓, Vitest **20/20** (repo roundtrip, corrupt-record skip, invalid-save rejection, export text, safeFileName, manifest, formatDuration), Playwright **3/3** (smoke; create→edit→autosave→close panel→reopen→data intact; two-step delete).
- **Test results:** All PASS, exit 0.
- **Regression checks:** Phase 1 smoke E2E still passing after UI restructure (updated to assert the new Projects form).
- **Known side effects / risks:** Clipboard copy not asserted in E2E (headless clipboard permissions) — covered by pure-function unit test + manual checklist. Autosave debounce means a panel closed within 400 ms relies on the pagehide flush; edge case documented. No phrase timestamps yet (Phase 3).
- **Related entries:** REV-0003 (Phase 1 baseline this builds on).
- **Follow-up:** User manual review in Chrome; EXP-0001 remains open; next coding phase = Phase 3 (audio playback + timestamps + overlay).

---

## 2026-10-25 — Phase 3 implementation

### REV-0005 — Local audio playback, manual phrase timestamps, synchronized overlay
- **Date:** 2026-10-25
- **Status:** Verified
- **Reported behavior:** Not a bug — implementation task (ROADMAP Phase 3). No audio/timing/overlay existed.
- **Steps to reproduce:** Before change: editor tanpa audio dan tanpa waktu.
- **Expected behavior:** Impor audio lokal, playback/seek/durasi, timestamp frasa manual yang dapat dikoreksi, overlay tiga teks mengikuti posisi audio; audio & teks tetap lokal (kriteria Phase 3).
- **Actual behavior:** Semua kriteria terverifikasi otomatis (unit + E2E Chromium).
- **Root cause:** n/a — feature work. Defects found during implementation listed below.
- **Fix or change:** DB v2 dengan store `audio` (ArrayBuffer, bukan Blob langsung, demi kompatibilitas structured clone; blob dibangun ulang saat dibaca); `audioRepo` (batas MAX_AUDIO_BYTES 100 MB); tipe Phrase + `start/end/notes` dan Project + `audioName/audioDuration` dengan validasi toleran terhadap record lama + normalisasi di projectRepo (migrasi tanpa putus); `timeFormat` (formatTimestamp/parseTimeInput m:ss.d, presisi sepersepuluh) dan `findActivePhraseId` (end terbuka, overlap → start terbesar menang) beserta unit test; hook `useAudioPlayer` (satu elemen Audio seumur hidup hook — mencegah playback ganda; object URL di-revoke; callback durasi dipanggil dari event handler); komponen `AudioControls` (impor file, putar/jeda, slider seek, waktu/durasi), `Overlay` (frasa aktif `aria-current` + auto-scroll + klik melompat), `TimeField` (parse on blur; invalid → kembali aman; remount via key saat nilai berubah dari luar), `PhraseCard` (baris timing + Set dari pemutar + catatan); ProjectEditor mengintegrasikan semuanya; footer versi Fase 3.
- **Defect 1 (TS2322 ×2):** fixture `makeProject` di dua test tidak memenuhi field Project baru — base fixture dilengkapi `audioName/audioDuration: null`.
- **Defect 2 (TS6133):** impor `useState` tak terpakai di PhraseCard setelah TimeField dipisah — dihapus.
- **Defect 3 (TS2345):** literal proyek baru di ProjectList kurang field audio — dilengkapi.
- **Defect 4 (ESLint exhaustive-deps):** effect memakai objek `player` yang tidak stabil — destrukturisasi `loadBlob` (stabil) sebagai dependency.
- **Defect 5 (E2E "Malformed value"):** Playwright `fill()` tidak mendukung `input[type=range]` — diganti helper `seekSlider` berbasis native value setter + dispatch `input` event (pola standar React).
- **Files changed:** `src/shared/{types,validation,timeFormat(+test),activePhrase(+test)}.ts`, `src/shared/storage/{db,audioRepo(+test),projectRepo}.ts`, test fixture updates, `src/sidepanel/hooks/useAudioPlayer.ts`, `src/sidepanel/components/{AudioControls,Overlay,TimeField}.tsx` (baru), `{PhraseCard,ProjectEditor}.tsx` (ditulis ulang), `App.tsx`, `sidepanel.css`, `e2e/extension.spec.ts` (+helper WAV & 2 tes), docs.
- **Tests run:** `npm run verify` → build ✓, tsc ✓, ESLint ✓, Vitest **35/35**, Playwright **5/5** (dua kali; termasuk asersi tambahan klik baris overlay).
- **Test results:** All PASS, exit 0.
- **Regression checks:** E2E Phase 1–2 (smoke, persistensi, hapus) tetap lulus setelah perubahan skema — normalisasi record lama teruji unit test khusus.
- **Known side effects / risks:** Durasi audio bergantung metadata yang terbaca saat pemutar aktif; overlay hanya tepat seakurat entri manual pengguna (by design). File >100 MB ditolak dengan pesan (skenario penyimpanan penuh belum diuji). Kecepatan putar & loop frasa belum ada (kandidat fitur dari hasil EXP-0001).
- **Related entries:** REV-0004 (baseline Phase 2).
- **Follow-up:** Review manual pengguna di Chrome; EXP-0001 tetap terbuka; coding berikutnya = Phase 4 (pembantu evaluasi kandidat).

---

## 2026-10-25 — Phase 4 implementation

### REV-0006 — Candidate evaluation helpers (estimasi suku kata, heuristik kepadatan, skor manual, ekspor eksperimen)
- **Date:** 2026-10-25
- **Status:** Verified
- **Reported behavior:** Not a bug — implementation task (ROADMAP Phase 4). Tidak ada kandidat/estimasi/skor sebelumnya.
- **Expected behavior:** 3 kandidat per frasa dengan label pendekatan; estimasi suku kata yang dapat dikoreksi; heuristik kepadatan berlabel estimasi; skor manual 5 dimensi dengan total berbobot berlabel hipotesis; perbandingan berdampingan; ekspor eksperimen (kriteria Phase 4).
- **Actual behavior:** Semua kriteria terverifikasi otomatis (unit + E2E Chromium termasuk memverifikasi isi file Markdown yang benar-benar diunduh).
- **Root cause:** n/a — feature work. Dua perbaikan heuristik penting terdokumentasi di bawah.
- **Fix or change:** Tipe `Candidate`/`CandidateScores` (Phrase.candidates, maks 3) dengan validasi toleran + normalisasi record lama; `heuristics.ts` — `estimateSyllables` (Indonesia: tiap vokal = nukleus, diftong ai/au/oi hanya disatukan di akhir kata; kana Jepang = 1 mora; kanji/kata tanpa vokal → uncertain), `effectiveSyllables` (override manual menang), `computeDensity`, `densityRisk` (ambang 1,25/0,7 dilabel HIPOTESIS), `weightedTotal` (null bila belum lengkap — tanpa presisi palsu); `experimentExport.ts` (Markdown per template log); UI `CandidateSection` (baris kandidat: teks, estimasi+override, chip risiko, 5 select skor, total, catatan, Gunakan/Hapus; tabel perbandingan berdampingan); PhraseCard & ProjectEditor diintegrasikan; tombol "Unduh eksperimen".
- **Perbaikan heuristik 1 (dari kegagalan tes):** versi awal menghitung kelompok vokal beruntun → "biasa" (bi-a-sa) salah dihitung 2 karena "ia" menyatu. Diperbaiki: tiap vokal = satu nukleus; diftong hanya di posisi akhir kata (pan-tai, ban-gau). Kegagalan tes inilah yang menangkap bug heuristik — nilai regresinya tinggi.
- **Perbaikan heuristik 2:** `densityRisk(2.1, 3.0)` gagal karena floating point (0.7000…01) — ditambah epsilon 1e-9.
- **Files changed:** `src/shared/{types,validation,heuristics(+test),experimentExport(+test)}.ts`, `src/shared/storage/projectRepo.ts` (+fixture test), fixture update di 3 test lain, `src/sidepanel/components/CandidateSection.tsx` (baru), `{PhraseCard,ProjectEditor}.tsx`, `sidepanel.css`, `App.tsx` (footer Fase 4), `e2e/extension.spec.ts` (+tes kandidat), docs.
- **Tests run:** `npm run verify` → build ✓, tsc ✓, ESLint ✓, Vitest **54/54**, Playwright **6/6**.
- **Test results:** All PASS, exit 0.
- **Regression checks:** Seluruh E2E Phase 1–3 tetap lulus setelah perubahan skema (normalisasi candidates [] untuk record lama teruji unit test).
- **Known side effects / risks:** Estimasi suku kata tetap heuristik (nama/negara/singkatan bisa meleset — koreksi manual tersedia dan JUSTRU jadi mekanisme utama). Ambang risiko & bobot skor belum terkalibrasi (menunggu data EXP-0001). Regenerasi kandidat otomatis menunggu Fase 5 (AI).
- **Related entries:** REV-0005 (baseline Phase 3).
- **Follow-up:** Review manual pengguna; EXP-0001 kini juga menghasilkan data kalibrasi ambang/bobot; coding berikutnya = Phase 5 (integrasi AI) yang MEMBUTUHKAN keputusan pengguna soal penyedia model & cara kredensial.

---

## 2026-10-25 — Phase 5 implementation

### REV-0007 — AI adaptation integration (BYO configuration, non-destructive fill, traceable output)
- **Date:** 2026-10-25
- **Status:** Verified
- **Reported behavior:** Not a bug — implementation task (ROADMAP Phase 5). Dua bug nyata ditemukan E2E selama implementasi (lihat Defect 1–2).
- **Expected behavior:** Kandidat AI dapat dibuat dari konfigurasi pengguna; output dapat disunting & terlacak; error dapat dipulihkan; kunci tidak pernah di kode sumber (kriteria Phase 5).
- **Root cause:** n/a — feature work; dua defect terverifikasi di bawah.
- **Fix or change:** Keputusan arsitektur tercatat di PROJECT_BRAIN §7: agnostik penyedia, endpoint kompatibel OpenAI yang dikonfigurasi pengguna. Modul `src/shared/ai/`: `types` (AiSettings/PhraseContext/GeneratedCandidate/AiError), `prompt` (system+user, instruksi JSON), `client` (satu percobaan, timeout AbortController 30 dtk, pemetaan pesan 401/403/429/5xx/jaringan/CORS, parser output berpaginasi code fence + validasi bentuk — TANPA retry otomatis), `settingsStore` (abstraksi KeyValueStore: chrome.storage.local saat berjalan sebagai ekstensi, memory untuk dev/test), `apply` (pengisian slot NON-DESTRUKTIF — hanya slot kosong, teks pengguna tidak pernah ditimpa). UI: tab Pengaturan (panel privasi + Base URL/Kunci API/Model + hapus konfigurasi), tombol "Buat kandidat (AI)" per frasa, label "oleh {model}" pada kandidat, `Candidate.generatedBy` (validasi toleran + normalisasi) yang ikut terekam di ekspor eksperimen.
- **Defect 1 (kritis, ditangkap E2E):** `chrome.storage` tidak tersedia karena manifest hanya meminta izin `sidePanel` — konfigurasi AI tercatat di memori sementara dan hilang saat tab berganti (editor membaca konfigurasi kosong). Fix: izin `"storage"` ditambahkan ke manifest; unit test manifest diperbarui (izin tetap minimal: sidePanel+storage).
- **Defect 2 (kritis, ditangkap E2E):** `isCandidateRecord` menolak `generatedBy: null` (cek hanya `undefined || string`) sehingga autosave proyek berkandidat baru selalu gagal ("Gagal menyimpan"). Fix: null diterima sebagai nilai sah "tulisan manual".
- **Defect 3:** normalisasi `baseUrl` belum membuang garis miring ujung — dipindah ke validator agar tersimpan kanonik.
- **Files changed:** `public/manifest.json`, `src/shared/ai/{types,prompt(+test),client(+test),settingsStore(+test),apply(+test)}.ts`, `src/shared/{types,validation}.ts`, `src/shared/storage/projectRepo.ts`, `src/shared/experimentExport.ts` (+test), `src/sidepanel/components/{SettingsPanel,CandidateSection,PhraseCard,ProjectEditor}.tsx`, `tabs.ts`, `App.tsx`, `sidepanel.css`, `e2e/extension.spec.ts` (+server uji 401 lokal), docs.
- **Tests run:** `npm run verify` → build ✓, tsc ✓, ESLint ✓, Vitest **74/74**, Playwright **7/7**.
- **Test results:** All PASS, exit 0.
- **Regression checks:** Seluruh E2E Phase 1–4 tetap lulus setelah perubahan skema & izin.
- **Known side effects / risks:** **Uji ke penyedia AI nyata BLOCKED** menunggu kunci pengguna — jalur sukses terverifikasi lewat mock fetch, jalur 401 lewat server lokal sungguhan. Untuk LLM lokal (Ollama) pengguna harus mengizinkan CORS (OLLAMA_ORIGINS). Tanpa izin host di manifest — mengandalkan CORS layanan (berlaku untuk penyedia cloud umum).
- **Related entries:** REV-0006 (baseline Phase 4).
- **Follow-up:** Pengguna mengisi konfigurasi AI & menguji dengan penyedia nyata; EXP-0001 tetap terbuka; sisa roadmap: Phase 6 (opsional) & Phase 7 (rilis).

---

## 2026-10-25 — Phase 6 implementation

### REV-0008 — Energy-based pause/onset analysis (local, explainable) with measured accuracy
- **Date:** 2026-10-25
- **Status:** Verified
- **Reported behavior:** Not a bug — implementation task (ROADMAP Phase 6, scoped MVP). Tidak ada analisis otomatis sebelumnya.
- **Expected behavior:** Deteksi jeda/batas frasa berbasis energi, diukur akurasinya, berlabel estimasi, koreksi manual tetap utama; kelayakan separation/pitch/alignment dieksplorasi dan diputuskan (kriteria Phase 6).
- **Fix or change:** `src/shared/audio/analysis.ts` — `analyzeEnergyPcm` (envelope RMS window 50 ms / hop 25 ms; ambang = 5% × RMS puncak; segmen ≥ 150 ms; jeda disarankan bila ≥ 250 ms — semua parameter terdokumentasi dan dapat dijelaskan) + `decodeForAnalysis` (mixdown mono). UI `AudioAnalysisPanel` (tombol analisis, ringkasan segmen/jeda, daftar jeda yang diklik → seek pemutar untuk verifikasi telinga, label estimasi + peringatan "bagian pelan ≠ jeda"). Editor melacak blob audio aktif (tidak pernah keluar dari perangkat).
- **Keputusan eksplorasi (terdokumentasi):** separasi vokal & pitch tracking DITUNDA (butuh model ML besar, implikasi lisensi/performa, belum ada kebutuhan terbukti); alignment suku kata DITUNDA (forced alignment butuh model; koreksi manual cukup cepat untuk MVP); estimasi tempo penuh DITUNDA (onset/batas sudah tersedia); Essentia.js DIHINDARI (ukuran & tinjauan lisensi).
- **Defect 1 (E2E timeout):** `new AudioContext()` di Chromium headless tanpa perangkat audio dapat menggantung decode — diganti `OfflineAudioContext` (decode tidak butuh perangkat keluaran), fallback AudioContext.
- **Defect 2 (E2E strict mode):** tombol "Jeda" bentrok dengan "Analisis **jeda**" — selector E2E diperbaiki `exact: true`.
- **Defect 3 (unit test):** ekspektasi awal mengira celah pendek menyatukan segmen — semantik benar: segmen tetap dua (fakta fisik), hanya SARAN jeda yang tidak muncul. Tes disesuaikan menggambarkan semantik itu.
- **Files changed:** `src/shared/audio/analysis.ts` (+test), `src/sidepanel/components/AudioAnalysisPanel.tsx` (baru), `ProjectEditor.tsx`, `sidepanel.css`, `e2e/extension.spec.ts` (makeWavBuffer bersegmen + tes analisis), docs.
- **Tests run:** `npm run verify` → build ✓, tsc ✓, ESLint ✓, Vitest **80/80** (termasuk 6 tes akurasi vs ground truth sintetis), Playwright **8/8**.
- **Test results:** All PASS, exit 0. Akurasi terukur: 3/3 segmen & 2/2 jeda pada sinyal uji, galat batas < 100 ms.
- **Regression checks:** Seluruh E2E Phase 1–5 tetap lulus.
- **Known side effects / risks:** **Akurasi pada musik nyata belum diukur** (butuh anotasi manual pengguna — kelanjutan EXP-0001). Ambang 5%/250 ms default bisa salah pada musik dengan bagian pelan — panel sudah memperingatkan. Beat/tempo penuh belum ada.
- **Related entries:** REV-0007 (baseline Phase 5).
- **Follow-up:** Pengguna menguji analisis pada lagu nyata + mencatat akurasinya (EXP-0001); sisa roadmap: Phase 7 (regresi penuh, rilis).
