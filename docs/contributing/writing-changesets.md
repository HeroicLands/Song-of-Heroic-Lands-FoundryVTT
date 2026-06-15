# Writing Changesets

SoHL uses [@changesets/cli](https://github.com/changesets/changesets) to manage
versioning and release notes. A **changeset** is a small Markdown file in
`.changeset/` that records one change and how it affects the version. At release
time, `changeset version` consumes every pending changeset to bump the version in
`package.json`, prepend a section to [`CHANGELOG.md`](../../CHANGELOG.md), and
populate the GitHub Release notes — then deletes the consumed files.

## When you need one

- **`feat/*` and `bug/*` branches always need a changeset** — even when the change
  is not user-facing.
- **`cleanup/*`, `docs/*`, and `chore/*` need none** — pure housekeeping, docs, or
  tooling with no shipped-behavior change.

See [Contributing → Development workflow](./contributing.md) for the full branch and
issue rules. Keep the changeset **current as the work evolves** — add to it when you
make a decision, fix a bug, or introduce a breaking change, not only at the end.

## Creating one (command line)

Interactive — prompts for the bump type and a summary, then writes a
randomly-named file under `.changeset/`:

```bash
npm run changeset
```

Or write the file by hand (often easier to match our formatting): create
`.changeset/<short-kebab-name>.md` with the frontmatter and summary shown below.

Verify a pending changeset exists before you push:

```bash
npm run changeset:check
```

`npm run changeset:version` (which bumps the version and rewrites `CHANGELOG.md`) is
a **maintainer/release** step — contributors do not run it.

## Anatomy of a changeset

```markdown
---
"sohl": patch
---

**One-line bold summary of the change**

Fixes [#123](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/123):
one or two sentences describing what the change does.

- a supporting detail
- another supporting detail
```

The frontmatter value is the **bump type**:

| Bump    | Use for                                                                                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `patch` | Bug fixes and internal changes with no new capability.                                                                                                                |
| `minor` | New features or capabilities. **Also breaking changes while pre-1.0** — the project is at `0.x`, so prefer `minor` for breaking changes and reserve `major` for 1.0+. |
| `major` | Reserved for 1.0+.                                                                                                                                                    |

## What to include

- A **bold one-line summary** — this is the headline that appears in the changelog.
- A **reference to the issue number** (see below).
- A concise description of **the change and its impact**, with bullets for notable
  sub-points.

### Reference the issue number

Every `feat`/`bug` changeset starts from a tracking issue, so link it. Write the
reference as a **Markdown link using the full issue URL** — not a bare `#123` — so it
renders as a clickable link in both `CHANGELOG.md` and the GitHub Release notes:

```markdown
Fixes [#123](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/123): …
```

- Put it at the **start of the summary body** (the first line after the bold
  headline), as in the example below.
- `Fixes` / `Closes` / `Refs` are interchangeable lead-ins — the linked number is
  what matters. (The issue is auto-closed by the `Fixes #123` keyword in the **PR
  description**, not by the changeset; the changeset's job is to carry the link into
  the changelog.)
- The issue number is also embedded in your branch name
  (`bug/issue_123_<slug>`), so it's the same number throughout.

## What not to include

- **Don't re-describe the problem.** The symptoms, repro, and root cause live in the
  issue. The changeset describes the _fix_ / _change_.
- **No `#` ATX headings in the summary.** Changesets wrap the whole summary into a
  single changelog bullet, so a `## Foo` becomes a real `<h2>` nested inside that
  bullet — it renders larger than the `### Minor Changes` heading above it and
  pollutes the document outline. Use `**bold labels**` for sub-headings instead.
- **Emphasis style:** `_underscores_` for italics, `**double asterisks**` for bold.
  Tables and nested lists are fine; only `#` headings are the problem.
- **Don't dump internal noise** — commit-by-commit logs, scratch notes, or a
  restatement of the diff.
- **Don't wait until the end** to write it.

## Example

A real patch changeset (`.changeset/fix-actor-pack-embedded-item-keys.md`):

```markdown
---
"sohl": patch
---

**Key embedded items when exporting the actors pack**

Fixes [#59](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/59):
the actor pack exporter now writes a hierarchical `_key`
(`!actors.items!<actorId>.<itemId>`, and `!actors.items.effects!…` for any
effects an item carries) on each embedded item. Foundry's LevelDB pack compiler
keys every embedded document by `_key`, so without it the compile aborted with
`LEVEL_INVALID_KEY` ("Key cannot be null or undefined") as soon as the actors
pack contained an actor.
```

## What it becomes in the CHANGELOG

At release, `changeset version` groups pending changesets under the new version by
bump type and renders each one as a bullet **prefixed by its commit hash** (the
project uses the `@changesets/changelog-git` changelog generator). The summary body
is indented two spaces beneath the bullet. The example above renders as:

```markdown
## 0.7.1

### Patch Changes

- a1b2c3d: **Key embedded items when exporting the actors pack**

    Fixes [#59](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/59):
    the actor pack exporter now writes a hierarchical `_key`
    (`!actors.items!<actorId>.<itemId>`, …) on each embedded item. …
```

A `minor` change lands the same way under a `### Minor Changes` heading. The GitHub
Release for the version emits only that version's section; the full history stays in
[`CHANGELOG.md`](../../CHANGELOG.md).
