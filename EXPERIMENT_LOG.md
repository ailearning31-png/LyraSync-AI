# LyraSync AI — Lyric and Audio Experiment Log

Record each manual lyric-adaptation experiment. Do not store copyrighted lyrics in a public repository unless the user has the necessary rights. Use private/local notes for material that must not be redistributed.

## Experiment template

### EXP-YYYYMMDD-NN — Short description
- **Date:**
- **Song / artist:**
- **Audio permission/source:** User-owned / Licensed / Permission granted / Other (explain)
- **Target section:** Verse / Chorus / Bridge / Other
- **Audio file reference:** Local filename or project asset ID; do not commit large copyrighted audio files
- **Phrase start/end:** 
- **Source lyric availability:** User-provided / Licensed source / User-corrected transcription
- **Romanization:** Not needed / Provided / User-corrected
- **Source syllable or phonetic-unit estimate:**
- **Phrase duration:**
- **Held vowels / pauses / melisma:**
- **Candidate A — meaning-first:**
- **Candidate B — balanced:**
- **Candidate C — singability-first:**
- **Scores (1–5):** Meaning / Naturalness / Rhythm / Stress / Singability / Audio result
- **Observed problems:** Crowding / Stretch risk / Stress mismatch / Meaning drift / Other
- **Suno or generation test settings:** Record enough to reproduce; never store secrets
- **Audio result:** Not tested / Passed / Mixed / Failed
- **What changed between iterations:**
- **Conclusion:** Verified for this phrase / Tentative / Inconclusive
- **Reusable rule, if any:**
- **Confidence:** Low / Medium / High
- **Next experiment:**

---

## EXP-0001 — First experiment (The Sun — Chanmina)
- **Status:** In progress — preparation complete; awaiting the user's manual run
- **Song / artist:** The Sun — Chanmina (user-owned local copy)
- **Audio reference:** `The Sun - Chanmina.mp3` — local file, gitignored. Measured via ffprobe (2026-10-25): MP3, 48 kHz, stereo, 212.22 s (≈ 3:32), ~250 kbps.
- **Procedure:** `EXPERIMENT_WORKSHEET_EXP-0001.md` (step-by-step method, anchored rubric, weighted-score hypothesis, winner rules)
- **Filled answers:** `local/EXP-0001-ISIAN.md` (gitignored — the GitHub repo is PUBLIC; copyrighted lyrics must never be committed)
- **Goal:** Determine whether source lyric overlay, phrase duration, and syllable estimates help select more singable Indonesian adaptations.
- **Method:**
  1. Select one short phrase (initially 2–4 lines).
  2. Note source text, optional romanization, start/end time, and obvious held notes or pauses.
  3. Create three Indonesian candidates: meaning-first, balanced, and singability-first.
  4. Read or sing each candidate along with the reference.
  5. Score each candidate and note specific mismatches.
  6. Test only the strongest candidate(s) in a music-generation workflow if the user has access and permission.
- **Important limitation:** Text length and syllable count do not establish melodic fit by themselves. Audio and human listening remain necessary.
- **Result:** Not run. (Worksheet ready; awaiting the manual run.)
