# LyraSync AI — Project Brain

> **Project status:** Planning / manual experiment first  
> **Product type:** Chrome Extension (Manifest V3)  
> **Primary language:** Indonesian  
> **Working name:** LyraSync AI  
> **Tagline:** Fit the Lyrics. Feel the Melody.

## 1. Product vision

LyraSync AI helps users adapt song lyrics into natural, singable Indonesian while preserving the source song's meaning and fitting the original melody, rhythm, phrase duration, and vocal stresses as closely as practical.

The tool should reduce trial-and-error in downstream music generation by identifying likely lyric-fit problems before the user tests a candidate in a music-generation service such as Suno.

## 2. Core principles

1. **Validate before coding.** The manual workflow must be tested before building complex automation.
2. **Audio is the timing reference.** Text length alone cannot prove that a lyric fits the melody.
3. **Syllable count is a heuristic.** One syllable can span several notes; melisma and held vowels are legitimate.
4. **Meaning and singability both matter.** A literal translation can be unsingable; a singable line must still preserve the intended message.
5. **Human correction is always available.** Automatic transcription, timing, beat, and pitch estimates can be wrong.
6. **Small, reversible changes.** Every revision should be limited, tested, and documented.
7. **No unsupported claims.** Do not report a feature as working unless it has been tested.
8. **Respect rights and service terms.** Use audio and lyrics the user owns, is licensed to use, or has permission to adapt. Do not bypass access controls or extract hidden content from streaming services.

## 3. Initial user workflow

1. Import a permitted local audio reference.
2. Select a short phrase (start with 2–4 lines).
3. Enter or correct source lyrics; optionally provide romanization when useful.
4. Mark phrase start/end times or correct suggested boundaries.
5. Generate multiple Indonesian adaptation candidates.
6. Compare meaning, naturalness, syllable density, stress, and phrase fit.
7. Preview/read/sing candidates against the reference.
8. Select a candidate and test it in the chosen music-generation workflow.
9. Record what worked and what failed.
10. Export/copy the approved lyrics and preserve experiment notes.

## 4. Scope and non-goals

### MVP scope
- Chrome Extension Manifest V3 with a side panel.
- Local audio import and playback.
- Manually editable source lyrics and romanization.
- Phrase-by-phrase lyric editor.
- Manual phrase timestamps to start; automated estimates may come later.
- Syllable-count estimate with user correction.
- Three candidate adaptation variants per phrase.
- Risk indicators: crowding, potential over-stretching, stress mismatch.
- Experiment notes and export/copy approved lyrics.
- Persistent local project storage.

### Not in the first MVP
- Guaranteed automatic alignment at every syllable.
- Guaranteed pitch or note detection.
- Automatic extraction of lyrics from streaming pages.
- Guaranteed control over Suno or other external generation services.
- Fully autonomous changes to source code or dependencies.

## 5. Evaluation dimensions

Score each dimension from 1–5:
- Meaning preservation
- Natural Indonesian
- Rhythm/phrase fit
- Word stress fit
- Singability
- Generated audio result (only after audio is actually tested)

Record observations separately from scores. Scores are experimental and must be calibrated against actual examples.

## 6. Technical direction (tentative)

- Chrome Extension Manifest V3.
- TypeScript + React + Vite, subject to an initial compatibility check.
- Side Panel UI.
- Web Audio API for local playback and basic audio interaction.
- IndexedDB for local projects and experiment records.
- Audio analysis libraries or backend services only after the manual workflow validates the need.
- Never embed private API keys or tokens in extension source code.
- Keep optional heavy analysis (separation, pitch, advanced alignment) out of the first MVP.

## 7. Decision status

| Decision | Status | Notes |
|---|---|---|
| Product name: LyraSync AI | Working decision | Can change if branding conflict is found |
| Manual experiments before coding | Required — superseded 2026-10-25 by user direction | User explicitly directed Phase 1 to proceed in parallel ("lanjut ke step selanjutnya"); EXP-0001 remains open and must still be run — its data calibrates heuristics |
| Indonesian singable adaptation | Core requirement | Preserve meaning and naturalness |
| Original/romanized lyric overlay | Core investigation | Compare text with phrase timing; romanization is not a timing measurement |
| Automatic audio analysis | Later phase → MVP implemented (2026-10-25) | Energy-based pause/onset detection, 100% local via Web Audio API, labeled as estimates; separation/pitch/alignment deferred with documented reasons; real-music accuracy pending EXP-0001 |
| AI agent memory and revision guard | Required development process | Documentation + tests + version control |
| AI integration: BYO configuration (2026-10-25) | Working decision | Provider-agnostic OpenAI-compatible endpoint configured by the user in-app; key only in `chrome.storage.local`, never in source; audio never sent — text only, on explicit button press |

## 8. Definition of useful progress

A phase is ready to advance when:
- Its acceptance criteria are written.
- The main workflow works on a representative test case.
- Known limitations are documented.
- Relevant tests pass or failures are explicitly accepted and recorded.
- Existing working features have been regression-tested.
- Project documentation and roadmap are updated.

## 9. Current next action

1. **Phase 1–6 built and verified in Chromium** (shell; editor + persistensi; audio + timestamp + overlay; kandidat + heuristik; AI BYO; analisis jeda energi berlabel estimasi dengan akurasi terukur pada sinyal sintetis).
2. **Pengguna:** uji di Chrome — muat ulang `dist/`, coba "Analisis jeda (estimasi)" pada lagu nyata, isi Pengaturan AI bila mau, dan **jalankan EXP-0001** (worksheet siap; kini juga mengukur akurasi saran jeda pada musik nyata).
3. Sisa roadmap: **Phase 7** — regresi penuh, tinjauan privasi/izin, dokumentasi rilis, tag versi stabil.
