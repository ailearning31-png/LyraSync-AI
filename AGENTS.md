# LyraSync AI — Instructions for AI Coding Agents

These instructions apply to every AI agent or assistant working on this repository.

## Before doing any work

1. Read `PROJECT_BRAIN.md`, `ROADMAP.md`, `REVISION_LOG.md`, `EXPERIMENT_LOG.md`, and `TEST_CHECKLIST.md`.
2. Inspect the current repository structure and existing implementation before proposing changes.
3. Check Git status and preserve all uncommitted user work.
4. Identify the current phase and its acceptance criteria.
5. Search the revision log for similar bugs or previous approaches before fixing an issue.

## Diagnose before editing

- Reproduce the problem when possible.
- Separate verified facts from hypotheses.
- Identify the likely root cause and the smallest safe fix.
- If the issue cannot be reproduced, say so and describe the evidence available.
- Do not make speculative changes across unrelated files.

## Change discipline

- Prefer the smallest coherent patch.
- Do not refactor unrelated code while fixing a bug.
- Do not change architecture, frameworks, dependencies, or storage formats without explaining the need and impact.
- Avoid adding dependencies unless there is a clear benefit.
- Do not overwrite user changes or remove existing features without explicit approval.
- Keep changes reversible and use Git commits/checkpoints where appropriate.

## Testing and regression

- Run the most relevant tests after each meaningful change.
- Run the applicable regression checklist before marking work complete.
- Add a regression test for a fixed bug when practical.
- If a test cannot be run, state exactly why.
- Never claim a test passed unless it was actually run and passed.
- Never claim the extension works in Chrome unless it has been loaded/tested in a real or suitable test environment.

## Memory and documentation

After each task, update relevant documents:
- `REVISION_LOG.md`: issue, root cause, files changed, tests, outcome.
- `PROJECT_BRAIN.md`: only durable decisions or important changes to product direction.
- `TEST_CHECKLIST.md`: new regression checks that prevent recurrence.
- `ROADMAP.md`: phase status and next action.
- `EXPERIMENT_LOG.md`: only for lyric/audio experiments, not ordinary software bug fixes.

Do not record secrets, API keys, access tokens, or sensitive personal data.

## Evidence-based learning

- Label observations as `Verified`, `Hypothesis`, `Decision`, or `Open question`.
- Do not turn one song's result into a universal lyric rule.
- Keep failed experiments; record why they failed.
- Reuse a prior fix only when the underlying cause is sufficiently similar.
- If a previous approach no longer works, explain the new evidence and supersede the old decision rather than silently erasing history.

## Scope and product constraints

- Keep the product focused on natural, singable Indonesian lyric adaptation aligned to a reference melody.
- Treat lyric length and syllable count as heuristics, not proof of fit.
- Support manual correction for automatic audio analysis.
- Respect copyright, user permissions, and external service terms.
- Do not scrape hidden lyrics or bypass access controls.
- Do not put private API credentials in extension code. Use a secure backend or user-provided configuration when needed.

## Completion report

At the end of a task, report:
1. What changed.
2. Why it changed.
3. Files touched.
4. Tests run and actual results.
5. Known limitations or unresolved issues.
6. Documentation updated.
7. Recommended next step.

Do not report “done” if essential tests failed or were not run. Use `PARTIAL` or `BLOCKED` where appropriate.
