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
