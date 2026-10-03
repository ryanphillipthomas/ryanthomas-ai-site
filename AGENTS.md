# Engineering workflow

This repository is the static ryanthomas.ai site: one `index.html` with inlined CSS, and no build, tests, or CI.

## Taking a task

Work in poteto-mode. Load the `poteto-mode` skill from pstack and follow it; it picks the playbook (bug fix, feature, hillclimb, and others), plans, delegates, and verifies. Do not write a separate loop when a playbook covers the job. If pstack is not available in this session, say so and follow the rest of this file directly.

A task handed in by a bot or a person needs four things. Ask for any that are missing before building.

1. The problem, in the reporter's words.
2. Acceptance criteria that someone can observe on the page.
3. The evidence required, such as desktop and mobile screenshots or a DOM check.
4. The branch to work on. Open or update a PR and stop. Never merge.

Reply with the PR link, the builder's report, and the verifier's report.

## Roles

Two role definitions carry this repository's context.

- `.cursor/agents/builder.md` implements one scoped change and checks it in a browser.
- `.cursor/agents/verifier.md` proves the change works, from a separate subagent that did not write it.

Give the builder the brief. Give a fresh verifier the original brief and the builder's report, not the builder's reasoning. Send failures to a fresh builder with the brief, the verifier's report, and the branch, then verify again.

Cloud Agents do not load custom agents from `.cursor/agents/`. When `builder` or `verifier` is not a callable subagent type, launch a `generalPurpose` subagent, tell it to read the matching file in full before any work, and say in your reply that you used this fallback. If no subagent can be launched, report that. One agent reviewing its own work is not independent verification.

## Verification

Generate the project verification skill with pstack's `/create-verification-skill` and keep it current with `/maintain-verification-skill`. It lives in `.cursor/skills/verify-ryanthomas-ai/` and, once it exists, is the source of truth for launching, driving, and checking the site. Until then, the run steps in the role files apply.
