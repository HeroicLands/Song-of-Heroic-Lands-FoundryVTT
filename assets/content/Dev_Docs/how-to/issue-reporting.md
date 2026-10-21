---
shortcode: issuereporting
name: {full: Issue Reporting, aliases: []}
type: doc
subType: howto
description: "How issues are typed, prioritized, labeled, and tied to capability milestones."
tags: [dev-how-to]
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Issue Reporting

This document defines how issues are created and classified in the `heroic-lands`
Song of Heroic Lands (SoHL) repositories.

The core discipline is simple — four axes, each answering a different question:

- **Type** — _"what shape of work is this?"_ One per issue, from a closed set of five.
- **Priority** — _"how soon and how badly does this need doing?"_ A GitHub issue field, one value, defaults to Medium.
- **Labels** — _"what is this about?"_ Categorization only, chosen **only** from the organisation's label set (§3). Never invent a label.
- **Milestone** — _"which capability gate does this advance?"_ A native GitHub milestone (no due date), at most one, selected from a curated set (see §4).

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
- A **refactor** that changes no external behavior is a **task**, tagged `flag/tech-debt` — it is not a feature and not a bug.

## 2. Priority (GitHub issue field)

Priority is a native **Priority** field on the issue itself — an
organization-level issue field, **not** a label and **not** tied to a Project. Set
it in the issue sidebar; the repo issue list filters on it
(`field.priority:high,medium`), and it is read/written through the GitHub issue
API. One value per issue, from: **Urgent · High · Medium · Low**.

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
- Priority is independent of type, labels, **and** milestone. A `flag/security`-labelled issue is **not** automatically Urgent: a hardening task with no known exploit can be Low; an exploit in the wild is Urgent. Judge impact, not the topic.
- An **epic**'s priority reflects the initiative's importance, not the max of its children.

## 3. Labels

Labels are defined once for the whole organisation, in `labels.yml` of the
`HeroicLands/.github` repository. This repository keeps no registry of its own,
and does not create labels; a label that does not exist there is not applied.
If none fits, note the gap in the issue body for a maintainer to decide.

| Group         | Labels                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `type/`       | `type/bug`, `type/feature`, `type/epic`, `type/task`, `type/spike` — exactly one per issue                                   |
| `area/`       | `area/documentation`, `area/devops`, `area/tests`, `area/content`, `area/system`, `area/site`, `area/layout`, `area/styling` |
| `flag/`       | `flag/breaking-change`, `flag/security`, `flag/regression`, `flag/tech-debt`                                                 |
| `status/`     | `status/blocked`, `status/question`                                                                                          |
| `resolution/` | `resolution/duplicate`, `resolution/wontfix`                                                                                 |
| `ci/`         | `ci/e2e`                                                                                                                     |

**When to use them here**

- `area/system` — the Foundry VTT game system code (TypeScript, data model, sheets, logic).
- `area/documentation` — developer, API and user documentation, and rules content.
- `area/content` — non-documentation assets: images, compendium packs, actors, items, journals.
- `area/site` — heroiclands.org: the site, Cloudflare Pages, CDN. `heroiclands-site` has no tracker of its own and is tracked here.
- `area/devops` — build, tooling, release pipeline, repository configuration.
- `area/tests` — Vitest, Quench, or Cypress test suites and harness.
- `flag/breaking-change` — alters a public API, data schema, or save compatibility.
- `flag/security` — touches an attack surface: auth, data integrity, macro/script execution, injection, or anything warranting private disclosure (§7).
- `ci/e2e` — on a pull request, runs the full Foundry end-to-end suite on the dedicated runner before merge. New commits on a labelled pull request request a fresh run. The same workflow runs nightly at 01:30 America/Los_Angeles and can be started manually with `workflow_dispatch`. Local iteration uses focused `e2e:fast` specs.

**Label rules**

- Labels are additive and orthogonal — `area/content` + `area/site` + `flag/regression` on one bug is fine.
- Do not use a label to express something a type, the priority field, or a milestone already expresses.
- Progress toward a capability is tracked by **milestones** (§4), not labels.

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

**The milestone set is curated, like the label set** — select from
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

1. Is something **broken** relative to intended behavior? > **bug** (add `flag/regression` if it used to work).
2. Is the outcome **genuinely uncertain** and the deliverable a **decision/answer**? > **spike** (state question + timebox).
3. Is this too large to ship as one issue, needing **multiple sub-issues** to coordinate? > **epic**.
4. Is it a **new capability or enhancement** that doesn't exist yet? > **feature**.
5. Otherwise — chore, maintenance, refactor, docs, tooling, release? > **task**.

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

If an issue would be labelled `flag/security` **and** describes an exploitable weakness
(not merely hardening), **do not open a public issue**. Use GitHub's private
security advisories / vulnerability reporting instead. SoHL ships into users'
Foundry instances, so a disclosed macro-injection or data-execution path has a
real (if small) attack surface. When in doubt, disclose privately and let a
maintainer decide whether to make it public.

## 8. Worked examples

**Bug, High, regression**

> **Title:** Fix character sheet failing to render after v14 migration
> **Type:** bug · **Priority:** High · **Labels:** `area/system`, `flag/regression` · **Milestone:** _(unset — maintenance on an already-crossed gate)_
> Body: reproduces on Foundry v14; sheet threw before the migration didn't. No workaround > High.

**Feature, Medium**

> **Title:** Add wound tracking to combat resolution
> **Type:** feature · **Priority:** Medium · **Labels:** `area/system` · **Milestone:** `Combat-capable` (advances exactly this gate)
> Body: new capability, single shippable unit, not blocking > Medium.

**Epic, Medium**

> **Title:** Core combat resolution
> **Type:** epic · **Priority:** Medium · **Labels:** `area/system` · **Milestone:** `Combat-capable`
> Body: coordinates ~8 sub-issues (initiative, attack rolls, damage, defense, …), each filed separately and linked. Serves the `Combat-capable` gate alongside other work.

**Task, Low**

> **Title:** Bump Vitest to latest and refresh snapshots
> **Type:** task · **Priority:** Low · **Labels:** `area/tests`, `area/devops` · **Milestone:** _(unset — serves no gate)_
> Body: routine maintenance, deferrable > Low.

**Spike, Medium**

> **Title:** Evaluate migrating data model to Foundry v14 DataModel API
> **Type:** spike · **Priority:** Medium · **Labels:** `area/system` · **Milestone:** _(unset — informs future work)_
> Body: **Question** — is the v14 DataModel API worth adopting now? **Timebox** — 1 day. **Deliverable** — written recommendation + rough migration cost. Follow-up issues to be filed from the finding.

**Security, Urgent**

> **Title:** (private advisory) Sanitize macro input in item description renderer
> **Type:** bug · **Priority:** Urgent · **Labels:** `flag/security`, `area/system`
> Filed as a **private advisory**, not a public issue, because it's exploitable.

## 9. Which repository does an issue belong in? {#9-which-repository-does-an-issue-belong-in}

The project spans several repositories in the `HeroicLands` organization, and **each
one tracks its own work.** There is no central tracker.

| Repository                        | Tracks                                                                                                | Standard                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Song-of-Heroic-Lands-FoundryVTT` | **This repository** — the system code, the `sohl` package, the system build                           | This document                                                                                                              |
| `sohl-thalorna`                   | The `thalorna` package — original setting content, and the `/thalorna` site                           | [its `.github/ISSUE_REPORTING.md`](https://github.com/HeroicLands/sohl-thalorna/blob/main/.github/ISSUE_REPORTING.md)      |
| `sohl-kethira-basic`              | The `kethira` package — unofficial Hârn fan material, Foundry packs only                              | [its `.github/ISSUE_REPORTING.md`](https://github.com/HeroicLands/sohl-kethira-basic/blob/main/.github/ISSUE_REPORTING.md) |
| `heroiclands-site`                | heroiclands.org — the site, Cloudflare Pages, the CDN                                                 | This document, via the `area/site` label                                                                                   |
| `package-build`                   | The shared build toolchain and the site theme every site renders through — layouts, partials, styling | [its `.github/ISSUE_REPORTING.md`](https://github.com/HeroicLands/package-build/blob/main/.github/ISSUE_REPORTING.md)      |

Only `heroiclands-site` has no tracker of its own: it is tracked here under the
`area/site` label, and closed here. That is a choice about where the work is _watched_,
not a contradiction of the delivery rule below — the rule picks the repository among
those that keep a backlog.

**The theme is the easiest one to misfile,** because a theme fault and a consumer
fault look identical in a browser. If a page renders wrong on more than one site it
is the theme; on exactly one, that site is feeding the theme different input and the
issue is that site's. Anything about a URL, menu entry, or branding is always the
consumer's — the theme carries no addresses.

**Every repository runs the same four axes.** Types and the Priority field are
organization-level, so they are literally shared. The issue forms and the §1–§8 rules
are duplicated into each repository and kept deliberately identical — a contributor
who knows one tracker knows them all. Labels are the same everywhere: they come from the organisation set in §3, and each
repository applies the ones that fit what it holds.

### Choosing the repository

**File the issue where the work will be done.** The rule is _delivery_, not subject —
if the fix is an edit to a file in a given repository, the issue belongs to that
repository, even when the symptom shows up somewhere else. Two cases that look alike
and are not:

- A Thalorna note renders wrong because its own frontmatter is malformed > an issue in
  `sohl-thalorna`.
- A Thalorna note renders wrong because `@heroiclands/package-build` mishandles valid
  frontmatter > an issue **here**, because that is where the package lives.

When the answer is genuinely "both", file in each repository and link them — the
symptom where it appears, the cause where it lives.

> **Closing keywords do not cross repositories.** A pull request in `sohl-thalorna`
> or `heroiclands-site` carrying
> `Closes HeroicLands/Song-of-Heroic-Lands-FoundryVTT#123` creates a reference but
> **does not close** the issue — GitHub only auto-closes within the same repository.
> A cross-repository issue is therefore **closed by hand**, with a comment linking
> the delivering commit or pull request. Never assume the keyword did it; check.

### Done means something different off-repo

The [[doc-systemdevelopment#definition-of-done|Definition of Done]]
lists gates that only exist here — a `.changeset/` entry, `npm run build`, `npm run
docs`, `npm run format:check`. Another repository's work cannot satisfy them and is
not expected to; verify with what that repository actually has. What still applies to
any tracked work, wherever it lands: a tracking issue in the delivering repository, a
correctly named branch, a verification step appropriate to that repository, updated
documentation, and a description of what changed and why.

## Self-check before filing

You should confirm all of these before submitting an issue:

- Exactly **one type** assigned, chosen via the §5 procedure.
- A **priority** is set. If above Medium, the body justifies it in one line.
- Every label comes from the organisation set in §3. **Zero** invented labels.
- No label duplicates what the type, priority field, or milestone already says.
- **Milestone** set only when the issue clearly advances one existing capability gate (§4); otherwise unset. **Never** invented.
- Title is imperative and specific; body follows the §6 shape for its type. Title should not encode labels or other field information.
- If `flag/security` + exploitable > routed to **private advisory**, not a public issue (§7).
- If **epic** > sub-issues are linked. If **spike** > question and timebox are present.
