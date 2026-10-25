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
- **Status:** Prepared — menunggu eksekusi pengguna (belum diuji)
- **Song / artist:** The Sun — Chanmina (user-owned local copy)
- **Audio reference:** `The Sun - Chanmina.mp3` — local file, gitignored. Measured via ffprobe (2026-10-25): MP3, 48 kHz, stereo, 212.22 s (≈ 3:32), ~250 kbps.
- **Procedure:** `EXPERIMENT_WORKSHEET_EXP-0001.md` (step-by-step method, anchored rubric, weighted-score hypothesis, winner rules)
- **Filled answers:** `local/EXP-0001-ISIAN.md` (gitignored — the GitHub repo is PUBLIC; copyrighted lyrics must never be committed)
- **Goal:** Determine whether source lyric overlay, phrase duration, and syllable estimates help select more singable Indonesian adaptations.
- **Kesiapan alat (audit Phase 7, 2026-10-25):** semua 6 langkah pengguna didukung dan teruji otomatis —
  1. Buka ekstensi tanpa error → E2E smoke lulus.
  2. Buka halaman Pengaturan → tab "Pengaturan" tersedia.
  3. Konfigurasi provider AI sesuai implementasi → BYO endpoint kompatibel OpenAI (Base URL + kunci + model; kunci hanya lokal).
  4. Masukkan satu frasa pendek → "Tambah frasa" + 3 kolom teks.
  5. Tekan "Buat kandidat (AI)" → tombol tersedia per frasa.
  6. Lihat kandidat atau pesan error yang jelas → jalur error teruji (belum dikonfigurasi / 401); **jalur sukses dengan penyedia nyata BELUM diuji — butuh kunci pengguna**.
- **Catatan mode:** TIDAK ada mode AI tanpa kunci. Opsi: layanan cloud ber-kunci (bisa gratis per data kuota) atau LLM lokal Ollama (gratis, tetap isi placeholder di kolom kunci + CORS `OLLAMA_ORIGINS`).
- **Important limitation:** Text length and syllable count do not establish melodic fit by themselves. Audio and human listening remain necessary.
- **Result:** Not run. (Belum diuji — menunggu pengguna; jangan mengarang hasil.)
- **Method:**
  1. Select one short phrase (initially 2–4 lines).
  2. Note source text, optional romanization, start/end time, and obvious held notes or pauses.
  3. Create three Indonesian candidates: meaning-first, balanced, and singability-first.
  4. Read or sing each candidate along with the reference.
  5. Score each candidate and note specific mismatches.
  6. Test only the strongest candidate(s) in a music-generation workflow if the user has access and permission.
- **Important limitation:** Text length and syllable count do not establish melodic fit by themselves. Audio and human listening remain necessary.
- **Result:** Not run. (Worksheet ready; awaiting the manual run.)
