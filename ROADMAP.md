# LyraSync AI — Roadmap

Status meanings:
- **Not started:** no implementation or experiment has begun.
- **In progress:** active work is underway.
- **Blocked:** a prerequisite is missing.
- **Ready for review:** acceptance criteria appear met; verify before advancing.
- **Complete:** acceptance criteria were tested and documented.

## Phase 0 — Project setup and manual validation
**Status:** In progress / manual experiment pending

Tasks:
- [ ] Choose the first song and a permitted local audio reference.
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
**Status:** Not started

Tasks:
- [ ] Confirm the development environment and preferred stack.
- [ ] Create a Manifest V3 extension with side panel.
- [ ] Add basic project shell and navigation.
- [ ] Add basic automated checks/build script.
- [ ] Load unpacked extension in Chrome and verify startup.

Acceptance criteria:
- Extension builds and loads without fatal errors.
- A minimal automated/manual smoke test is documented.
- Git repository and version checkpoint exist.

## Phase 2 — Manual lyric editor and project persistence
**Status:** Not started

Tasks:
- [ ] Create/edit projects and phrases.
- [ ] Enter source, romanized, and Indonesian text separately.
- [ ] Save and reopen projects locally.
- [ ] Add export/copy and basic validation.

Acceptance criteria:
- Core editing workflow survives closing/reopening.
- Text fields remain independent.
- Regression checklist passes.

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
Complete Phase 0 manually. Do not begin advanced audio analysis before the overlay and phrase-level workflow have demonstrated value.
