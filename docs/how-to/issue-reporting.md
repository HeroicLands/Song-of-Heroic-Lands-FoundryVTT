# Issue Reporting

This document defines how issues are created and classified in the `heroic-lands`
Song of Heroic Lands (SoHL) repositories.

The core discipline is simple — four axes, each answering a different question:

- **Type** — _"what shape of work is this?"_ One per issue, from a closed set of five.
- **Priority** — _"how soon and how badly does this need doing?"_ A GitHub Projects field, one value, defaults to Medium.
- **Labels** — _"what is this about?"_ Categorization only, chosen **only** from the registry below. Never invent a label.
- **Milestone** — _"which capability gate does this advance?"_ A native GitHub milestone (no due date), at most one, selected from a human-curated set (see §4).

Type, priority, and milestone are structured single values (one each). Labels
stack. Keep the roles separate: do not encode priority, urgency, or work-shape as a
label; do not encode subject matter as a type; and do not encode a capability gate
as a label when a milestone is its proper home.

## 1. Issue types

Exactly **one** type per issue. Choose using the decision procedure in §5 when in
doubt. Do not leave an issue untyped.

| Type        | Use it when…                                                                                                                                                        | Do **not** use it for…                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **bug**     | Existing, shipped behavior is wrong or broken relative to what it should do — an error, crash, incorrect result, or regression.                                     | Missing capability (that's a _feature_); known-incomplete work in progress; a chore.                                   |
| **feature** | A new capability or enhancement that does not exist yet, deliverable as one shippable unit of value.                                                                | Anything broken (_bug_); work large enough to need many sub-issues (_epic_); pure maintenance (_task_).                |
| **epic**    | A large body of work that only makes sense decomposed into multiple sub-issues; a coordinating container tracked by its children.                                   | Anything you can ship as a single issue. If it has no sub-issues, it is not an epic.                                   |
| **task**    | Necessary work that is neither a defect nor a new capability: chores, maintenance, refactors, dependency bumps, tooling, docs, releases. May or may not touch code. | Work whose outcome is uncertain and exploratory (_spike_); a defect (_bug_).                                           |
| **spike**   | A **timeboxed** investigation whose deliverable is a _decision, answer, or recommendation_ — not shipped code. Outcome is genuinely uncertain going in.             | Work whose steps are already known (that's a _task_). A spike that produces code instead of a conclusion was mistyped. |

**Type rules**

- **MUST** assign exactly one type.
- A **bug** is _broken_; a **feature** is _missing_. That distinction resolves most ambiguity — decide which word fits before anything else.
- An **epic** MUST link its sub-issues (native GitHub sub-issues; see §6) and SHOULD carry little implementation detail of its own. Its acceptance is "all sub-issues closed and the whole verified together."
- A **spike** MUST state (a) the question it answers and (b) its timebox. It closes when the question is answered, and it typically _spawns_ follow-up feature/task/bug issues rather than doing the work itself.
- A **refactor** that changes no external behavior is a **task**, tagged `tech-debt` — it is not a feature and not a bug.

## 2. Priority (GitHub Projects field)

Priority is a GitHub **Priority** field on the project board (a Projects v2
single-select), **not** an issue label — so an issue must be on the project to
carry one. One value per issue, from: **Urgent · High · Medium · Low**.

Priority is about attention, not schedule — this project has no deadlines, so
priority answers "when I next sit down, what deserves my time?" not "what is due."

| Priority   | Meaning                                                      | Typical triggers                                                                                                                                        |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Urgent** | Do it next session. Active harm or a hard blocker.           | Data loss or corruption; a security issue being exploited; the system fails to load in a supported Foundry version; blocks the current capability gate. |
| **High**   | Wanted soon; the current gate leans on it.                   | Broken capability with no workaround; work the active milestone depends on.                                                                             |
| **Medium** | **Default.** Should get done; not blocking the current gate. | Most features and tasks; bugs with a workaround.                                                                                                        |
| **Low**    | Deferrable indefinitely with little cost.                    | Cosmetic issues; nice-to-haves; long-tail edge cases; opportunistic cleanup.                                                                            |

**Priority rules**

- **MUST** set a priority on every issue.
- **Default to Medium.** Anything higher MUST be justified in the body (one line: why the impact warrants it). Do not inflate — not everything is High.
- Priority is independent of type, labels, **and** milestone. A `security`-labelled issue is **not** automatically Urgent: a hardening task with no known exploit can be Low; an exploit in the wild is Urgent. Judge impact, not the topic.
- An **epic**'s priority reflects the initiative's importance, not the max of its children.

## 3. Labels — the closed registry

Labels are for **categorization only**. The table below is the **complete,
authoritative set**. Its machine-readable twin is `.github/labels.yml`, which the
`labels-sync` workflow reconciles onto GitHub (the set is _closed_ — a label not
in the registry is deleted on sync). `npm run lint` fails if the two disagree
(`check-labels`), so they cannot drift.

> **MUST NOT invent, rename, or improvise labels.** If no existing label fits, add
> none and (if it matters) note the gap in the issue body for a human to decide.
> Extending this registry is a human decision made by editing **both** this table
> and `.github/labels.yml`, not something an agent does at filing time.

| Label             | Scope                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `system`          | The Foundry VTT game system code (TypeScript, data model, sheets, logic).                                                               |
| `documentation`   | The Foundry VTT game system documents (dev, api, user docs, rules content, etc.)                                                        |
| `content`         | Non-documentation assets, such as new or modified images, compendium packs, actors, items, journals, or other content                   |
| `thalorna`        | Thalorna setting material.                                                                                                              |
| `site`            | heroiclands.org — Hugo site, Cloudflare Pages, CDN.                                                                                     |
| `devops`          | Build, tooling, release pipeline, repo config.                                                                                          |
| `tests`           | Vitest, Quench, or Playwright test suites and harness.                                                                                  |
| `security`        | Touches an attack surface: auth, data integrity, macro/script execution, injection, or anything warranting private disclosure (see §7). |
| `tech-debt`       | Restructuring or cleanup of working code; refactors.                                                                                    |
| `regression`      | Something that previously worked and stopped. Pairs with type `bug`.                                                                    |
| `breaking-change` | Alters a public API, data schema, or save compatibility.                                                                                |
| `blocked`         | Cannot proceed until an external dependency or another issue clears.                                                                    |
| `duplicate`       | This issue or pull request already exists                                                                                               |
| `question`        | Further information is requested                                                                                                        |
| `wontfix`         | This will not be worked on                                                                                                              |

> **No capability-gate labels.** Progress toward a capability is tracked by
> **milestones** (§4), not labels. Do not add `combat`-style or `v3.0`-style labels
> to mark what a milestone already carries.

**Label rules**

- Choose labels **only** from this file. No exceptions.
- Labels are additive and orthogonal — `security` + `system` + `regression` on one bug is fine.
- Do not use a label to express something a type, the priority field, or a milestone already expresses.

## 4. Milestones — capability gates

Milestones here are **capability gates, not calendar dates.** Each milestone is a
demonstrable threshold the system crosses — a state you can point at and say "it does
this now" — and **crossing a gate is what triggers a release** (see "Milestones and
releases" below). This project is not date-driven and has no deadlines, and GitHub
supports that directly: **a milestone's due date is optional, and its progress bar is
computed from the ratio of closed to open issues, not from any date.** Leave due dates
blank.

**Name milestones by the capability reached,** phrased as a state of the system:

- `Holds a character` — can create and persist a character.
- `Combat-capable` — can resolve combat between characters.
- `Automated combat` — can run combat between characters automatically.

…and so on. These form a natural progression — later gates depend on earlier ones.
GitHub does not model milestone dependencies, so if you want the order explicit,
encode it in the name (`M1 · Holds a character`, `M2 · Combat-capable`, …); otherwise
let the list carry it.

**An issue's milestone is the gate its work advances.** When every issue in a
milestone is closed, the system has crossed that gate. One milestone per issue
(GitHub enforces this); if an issue seems to serve two gates, it usually belongs to
the earlier one or is scoped too large.

**Milestone vs. epic — different lenses, keep them straight:**

|           | **Epic** (a type)                          | **Milestone** (a gate)                           |
| --------- | ------------------------------------------ | ------------------------------------------------ |
| Groups by | work breakdown — a tree of sub-issues      | outcome — a capability the system gains          |
| Answers   | "what are all the pieces of _this build_?" | "how close is the system to _doing this thing_?" |
| Done when | all its sub-issues are closed              | all issues tagged to it are closed               |
| Shape     | vertical: one initiative, decomposed       | horizontal: a slice across the whole system      |

A milestone can contain several epics plus loose issues; an epic serves a milestone.
The `Combat-capable` **milestone** might hold the `Core combat resolution` **epic**
(with its sub-issues), a `Wound model` **epic**, a loose "add combat log panel" task,
and a stray bug found along the way — all rolling into one progress bar. **Rule of
thumb:** every major capability gets a **milestone**; add an **epic** only for a chunk
big enough to need its own sub-issue tree. A gate reached with a handful of loose
issues needs the milestone but no epic.

**The milestone set is human-curated, like the label registry** — agents select from
existing gates and never invent one.

Because gates are capability-based, their mapping is usually inferable
from an issue's content:

- You MAY assign an issue to a milestone when its work **unambiguously advances exactly one existing gate**.
- Leave the milestone **unset** when the issue advances none of the current gates (it is future/backlog), spans several, or the mapping is unclear. An unset milestone is a normal, correct state.
- You MUST NOT create a new milestone. If no gate fits and one seems warranted, note it in the body and raise it for awareness.

### Milestones and releases

**Reaching a gate is what cuts a release.** When every issue in a milestone is
closed, the system has demonstrably gained that capability — and that is the
trigger to cut a new release, versioned for the capability reached, not for any
date. There is no release calendar and no due dates: releases are **paced by
capability**, so the milestone progress bar (closed vs. open issues) is the only
schedule the project keeps. Leave every milestone's due date blank.

## 5. Choosing the type — decision procedure

Walk this in order; take the first match.

1. Is something **broken** relative to intended behavior? → **bug** (add `regression` if it used to work).
2. Is the outcome **genuinely uncertain** and the deliverable a **decision/answer**? → **spike** (state question + timebox).
3. Is this too large to ship as one issue, needing **multiple sub-issues** to coordinate? → **epic**.
4. Is it a **new capability or enhancement** that doesn't exist yet? → **feature**.
5. Otherwise — chore, maintenance, refactor, docs, tooling, release? → **task**.

Then, regardless of type: set **priority** (default Medium; justify higher), apply
any **labels** from §3 that categorize it, and set a **milestone** only when the issue
clearly advances one existing capability gate (§4) — otherwise leave it unset.

## 6. Body structure by type

Titles: imperative and specific. "Fix stamina regen ignoring encumbrance," not
"stamina bug." No trailing punctuation.

Every issue body should give enough context that someone with repo familiarity but
no memory of the conversation can act on it. Use the shape for its type:

### Bug

Bugs should describe the problem as fully as possible, so it may be easily reproduced. However, the description should NOT contain a description of how to fix the issue. Suggestions for fixes or approaches may be placed in comments.

**Acceptance criteria** is optional.

```
## Summary
One sentence: what's wrong.

## Steps to reproduce
1. …
2. …

## Expected vs. actual
Expected: …
Actual: …

## Acceptance criteria
- [ ] Observable condition 1
- [ ] Observable condition 2

## Environment
Foundry version · SoHL system version · browser/OS if relevant

## Notes
Stack traces, console output, suspected cause.
```

### Feature

A feature should describe the problem to be solved or gap addressed, and possibly provide justification or benefit analysis.

```
## Problem / motivation
What need or gap this addresses.

## Proposed solution
What to build. Sketch the approach if known.

## Acceptance criteria
- [ ] Observable condition 1
- [ ] Observable condition 2
```

### Epic

An epic should provide an overall explanation covering an area described by one or more issues (which may or may not yet exist). Deciding at what point an issue should be an epic is an art, but certainly if you anticipate more than one PR, or if the work involves multiple domains, the issue should probably be an epic.

```
## Goal
The outcome this initiative delivers.

## Scope
In scope / out of scope.

## Sub-issues
(Linked as native sub-issues; list mirrors them.)
- [ ] #…
- [ ] #…

## Done when
All sub-issues closed and integration verified.
```

### Task

```
## What
The work to be done.

## Why
The reason it's needed (keeps chores from looking arbitrary).
```

### Spike

```
## Question
The specific thing we need to decide or learn.

## Timebox
e.g. 1 day / 4 hours. MUST be present.

## Deliverable
The form of the answer: a decision, a recommendation, a written finding,
a prototype-to-throw-away. NOT production code.

## Follow-up
Note that follow-up feature/task/bug issues will be filed from the outcome.
```

## 7. Security issues — special handling

If an issue would be labelled `security` **and** describes an exploitable weakness
(not merely hardening), **do not open a public issue**. Use GitHub's private
security advisories / vulnerability reporting instead. SoHL ships into users'
Foundry instances, so a disclosed macro-injection or data-execution path has a
real (if small) attack surface. When in doubt, disclose privately and let a human
decide whether to make it public.

## 8. Worked examples

**Bug, High, regression**

> **Title:** Fix character sheet failing to render after v14 migration
> **Type:** bug · **Priority:** High · **Labels:** `system`, `regression` · **Milestone:** _(unset — maintenance on an already-crossed gate)_
> Body: reproduces on Foundry v14; sheet threw before the migration didn't. No workaround → High.

**Feature, Medium**

> **Title:** Add wound tracking to combat resolution
> **Type:** feature · **Priority:** Medium · **Labels:** `system` · **Milestone:** `Combat-capable` (advances exactly this gate)
> Body: new capability, single shippable unit, not blocking → Medium.

**Epic, Medium**

> **Title:** Core combat resolution
> **Type:** epic · **Priority:** Medium · **Labels:** `system` · **Milestone:** `Combat-capable`
> Body: coordinates ~8 sub-issues (initiative, attack rolls, damage, defense, …), each filed separately and linked. Serves the `Combat-capable` gate alongside other work.

**Task, Low**

> **Title:** Bump Vitest to latest and refresh snapshots
> **Type:** task · **Priority:** Low · **Labels:** `tests`, `devops` · **Milestone:** _(unset — serves no gate)_
> Body: routine maintenance, deferrable → Low.

**Spike, Medium**

> **Title:** Evaluate migrating data model to Foundry v14 DataModel API
> **Type:** spike · **Priority:** Medium · **Labels:** `system` · **Milestone:** _(unset — informs future work)_
> Body: **Question** — is the v14 DataModel API worth adopting now? **Timebox** — 1 day. **Deliverable** — written recommendation + rough migration cost. Follow-up issues to be filed from the finding.

**Security, Urgent**

> **Title:** (private advisory) Sanitize macro input in item description renderer
> **Type:** bug · **Priority:** Urgent · **Labels:** `security`, `system`
> Filed as a **private advisory**, not a public issue, because it's exploitable.

## Self-check before filing

You should confirm all of these before submitting an issue:

- [ ] Exactly **one type** assigned, chosen via the §5 procedure.
- [ ] A **priority** is set. If above Medium, the body justifies it in one line.
- [ ] Every label comes from the §3 registry. **Zero** invented labels.
- [ ] No label duplicates what the type, priority field, or milestone already says.
- [ ] **Milestone** set only when the issue clearly advances one existing capability gate (§4); otherwise unset. **Never** invented.
- [ ] Title is imperative and specific; body follows the §6 shape for its type. Title should not encode labels or other field information.
- [ ] If `security` + exploitable → routed to **private advisory**, not a public issue (§7).
- [ ] If **epic** → sub-issues are linked. If **spike** → question and timebox are present.
