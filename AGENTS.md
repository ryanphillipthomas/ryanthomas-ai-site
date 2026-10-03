# Engineering workflow

This repository is the static ryanthomas.ai site: one `index.html` with inlined CSS, and no build, tests, or CI.

## Taking a task

Work in poteto-mode. Load the `poteto-mode` skill from pstack and follow it. It picks the playbook (bug fix, feature, hillclimb, and others), plans, delegates, and verifies. Do not write a separate loop when a playbook covers the job. You stay the top-level Cloud Agent coordinator.

Decide pstack availability from the skill system, not from PATH:
- Treat pstack as available when `poteto-mode` is present in the session skill catalog.
- Treat pstack as available when you can resolve its SKILL.md through Cursor's plugin or skill system.
- Do not test availability with a `pstack` CLI binary or `which pstack`.
- Do not depend on a `pstack` executable existing on PATH.

`poteto-mode` sets `disable-model-invocation` to true, so you load and apply it yourself for engineering tasks this file covers. If poteto-mode loads, do not report that pstack is unavailable. After poteto-mode loads, name any unresolved optional skill, sibling skill, or principle file as unavailable. Do not say all of pstack is unavailable. Keep using this file and the repo's Investigator, Builder, and Verifier contracts for any missing dependency. If poteto-mode is not in the skill catalog and you cannot resolve its SKILL.md, say that poteto-mode is unavailable and follow the rest of this file directly.

A task handed in by a bot or a person needs four things. Ask for any that are missing before building.

1. The problem, in the reporter's words.
2. Acceptance criteria that someone can observe on the page.
3. The evidence required, such as desktop and mobile screenshots or a DOM check.
4. The branch to work on. Open or update a PR and stop. Never merge.

For bugs, regressions, unclear behavior, layout problems, or tasks where the cause is uncertain, dispatch Investigator, then Builder, then a fresh Verifier.

For an already bounded or simple implementation request, dispatch Builder, then a fresh Verifier.

Reply with the PR link, the builder's report, and the verifier's report. When an investigator ran, include that report too.

## Roles

Three role files carry this repository's context.

- `.cursor/agents/investigator.md` diagnoses the problem and writes a bounded implementation brief.
- `.cursor/agents/builder.md` implements one scoped change and checks it in a browser.
- `.cursor/agents/verifier.md` proves the change works, from a separate subagent that did not write it.

The builder does not perform the independent final verification. The verifier does not edit source. The investigator does not edit source.

Give the investigator the original problem in the reporter's words. When an investigation ran and was necessary, give the builder the investigator's builder brief. Otherwise give the builder the original brief. Give a fresh verifier the original brief and the builder's report, not the builder's reasoning. Send failures to a fresh builder with the brief, the verifier's report, and the branch, then verify again.

When `investigator`, `builder`, or `verifier` is not a callable subagent type, launch a `generalPurpose` subagent, tell it to read the matching file in full before any work, and say in the reply that you used this fallback. If no subagent can be launched, report that. One agent reviewing its own work is not independent verification.

## Verification

Generate the project verification skill with pstack's `/create-verification-skill` and keep it current with `/maintain-verification-skill`. It lives in `.cursor/skills/verify-ryanthomas-ai/` and, once it exists, is the source of truth for launching, driving, and checking the site. Until then, the run steps in the role files apply.
