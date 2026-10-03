# Engineering workflow

The main Cursor chat is the coordinator. The project agents are capability roles:

- `builder`: implements scoped changes, investigates causes, and builds one experiment at a time.
- `verifier`: independently checks behavior and measures candidates against the task's acceptance criteria.

Both definitions retain this repository's website context. Other repositories can use the same role names with their own platform instructions. Tracing, screenshots, snapshots, and debugging are capabilities; they do not each need a permanent agent.

## Delegation

Pass the task requirements and relevant context to builder. Pass the original requirements and builder's report to a separate verifier. Return failures to builder, then verify the corrected revision again.

This cloud session previously exposed only fixed subagent types. If custom names are unavailable, launch separate `generalPurpose` agents with the full corresponding definition and task context. Report that fallback honestly. Renaming or merging files does not prove registration. If no subagent facility is available, report the limitation rather than presenting one agent's self-review as independent.

## Verification foundation

Use Pstack's `/create-verification-skill` to generate a runnable project-specific verification skill: launch, check instance health, drive user behavior, capture evidence, and clean up. Include a small feature map with observable success criteria. Execute the generated instructions before treating the skill as ready.

Public sources:
- https://github.com/cursor/plugins/tree/main/pstack/skills/create-verification-skill
- https://github.com/poteto/verification-skill-example

The latter is fictional and omits its driver scripts. This configuration does not install that driver or a SpaceX internal skill.

## Hillclimbing

The coordinator owns the evaluator and runs Pstack's hillclimb playbook when a measurable improvement task warrants it:
https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/hillclimb.md

Before the first experiment, establish the realistic workload, metric (or explicit qualitative rubric), baseline, repeatable measurement command, regression gates, target, and attempt/time budget. Prove the evaluator can distinguish meaningful changes and then freeze it. A changed evaluator needs a new baseline.

Loop: hypothesis → builder candidate → independent verification → keep or revert → next hypothesis.

Record each attempt's hypothesis, revision, before/after result, regression outcome, evidence paths, and verdict. Keep only improvements supported by evidence without breaking required behavior; preserve user work when reverting a candidate. Stop at the agreed target/stop condition or budget, and surface blockers or exhausted useful hypotheses. Do not start an unattended loop merely because these instructions exist.
