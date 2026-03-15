# Journal Generation Spec (Markdown → Foundry Journal Pack)

See also: [Documentation Hub](../README.md), [User Documentation Source](../user/README.md), [Developer Documentation Index](../dev/README.md)

> **Goal:** Maintain user documentation in one source (`/docs/user/*.md`) and generate:
>
> - A Foundry journal compendium pack for in-system help
> - (Later) a PDF user manual

This spec defines:

- source format conventions
- transformation rules
- output structure
- build integration with existing repo scripts

## Source of truth

- **Source:** `/docs/user/**/*.md`
- **Assets:** `/docs/user/assets/**` (images used by docs)

Rationale:

- Keeps docs separate from runtime assets
- Allows multiple output formats from one source

Current repo status:

- `docs/user` now contains starter user guide chapters.
- `docs/user` remains the source root for generated journal docs.

Licensing note:

- See `LICENSE.md` for current documentation/content licensing scope.

## Foundry output target

### Generated pack

- Index artifact: `build/stage/packs/user-manual/journal-index.json`
- Foundry source JSON output: `build/tmp/packs/journals/`
- Pack type: **JournalEntry**
- Pack id/name: `journals` (existing system pack)

### Runtime packaging

- Keep generated source JSON in `build/tmp/packs/journals`.
- Use existing pack tooling to compile into `build/stage/packs/journals`.

The `journals` pack entry already exists in `assets/templates/system.template.json`.

This aligns with existing pack tooling (`utils/packs/build-compendiums.mjs`) and release processes.

## Build integration

Add a new script (suggested):

- `utils/build-journals.mjs`

Wire into `package.json`:

- `docs:guides` (or `docs:journals`) runs journal generation
- `docs` runs:
    1. existing `docs:prepare`
    2. TypeDoc generation
    3. journal generation

Current repo status:

- Existing docs scripts are `docs:prepare`, `docs:html`, `docs:md`, and `docs:journals`.
- `docs:journals` runs `utils/build-journals.mjs` and emits:
    - index metadata to `build/stage/packs/user-manual/journal-index.json`
    - Foundry-ready journal/folder source JSON to `build/tmp/packs/journals`

## Markdown conventions (authoring rules)

### File structure

- One topic per file.
- Filenames prefixed for ordering:
    - `00-quickstart.md`
    - `10-character-creation.md`
    - `20-combat-basics.md`

### Required front matter (YAML)

Each file begins with:

```yaml
---
title: "Combat Basics"
slug: "combat-basics"
category: "User Guide"
order: 20
tags:
    - combat
    - tests
foundry:
    folderId: "7e552e2050880585"
    permissions: "default"
---
```

Notes:

- `slug` becomes the journal entry id/key.
- `order` controls sorting inside a folder.
- `foundry.folderId` is the target Foundry Folder document id string.

### Journal page blocks

Each markdown file maps to one Journal Entry and can contain one or more pages.

Page delimiters use `:::page` directives:

```md
:::page name="Page Name"
Markdown content for a text page.
:::

:::page name="Image Example" type="image" src="assets/user/example.png"
:::

:::page name="Video Example" type="video" src="assets/user/example.webm"
:::
```

Rules:

- Every page must define `name`.
- `type` defaults to `text` if omitted.
- Supported page types: `text`, `image`, `video`.
- `src` is required for `image` and `video` pages.
- A page ends at either:
    - a line containing only `:::`
    - the next `:::page ...` directive
    - end-of-file
- Content outside any page block is automatically wrapped into a first text page.

### Internal links

Use relative links between docs:

- `[Character Creation](../user/10-character-creation.md)`
- `[Combat Basics](20-combat-basics.md)`

Generator must rewrite links:

- Markdown-to-journal links become `@UUID[JournalEntry.<id>]{Title}` (or Foundry’s preferred syntax for your version).

### Images

Embed images like:

```md
![Attack dialog](assets/attack-dialog.png)
```

Generator must:

- copy `/docs/user/assets/**` into a runtime-accessible doc asset path, e.g.:
    - `assets/docs/user-manual/...`
- rewrite image URLs accordingly.

### Callouts

Support simple callout blocks:

```md
:::tip
This is a tip.
:::

:::warning
This can break your character.
:::
```

Generator converts these to HTML blocks with classes compatible with Foundry’s journal renderer.

### Code blocks

Code fences remain as `<pre><code>` blocks.

## Transformation pipeline

### Step 1 — Parse markdown + front matter

For each `docs/user/**/*.md`:

- parse YAML front matter
- validate required fields: `title`, `slug`, `order`, `foundry.folderId`

### Step 2 — Convert Markdown to HTML

Use a deterministic Markdown parser (e.g., markdown-it) with:

- heading anchors
- table support
- callout plugin support (or custom)

### Step 3 — Rewrite links

- Relative links to `.md` files:
    - resolve target slug
    - replace with Foundry UUID link syntax:
        - `@UUID[JournalEntry.<slug>]{<title>}`
- External links remain external.

### Step 4 — Rewrite images

- Copy source assets to `assets/docs/user-manual/` (or your chosen path)
- Replace `assets/foo.png` with `assets/docs/user-manual/foo.png`

### Step 5 — Emit Foundry JournalEntry JSON

For each source doc, emit a JournalEntry record.

Minimal fields (conceptual; adjust to your Foundry generation schema):

- `name`: from `title`
- `pages[]`: generated page records from `:::page` blocks
- `folder`: from `foundry.folderId`
- `sort`: from `order`
- `flags`:
    - include `sohl.slug`, `sohl.tags`, etc. for traceability

### Step 6 — Use pre-existing folder IDs

Journal generation does not build folder records from markdown.

- `foundry.folderId` must reference an existing folder id in your pack/world workflow.
- Folder creation/management is handled outside this markdown-to-journal generator.

### Step 7 — Build pack

Write to a compendium pack format consistent with your existing packaging system.

In this repo, the current pack flow is:

- compile/unpack source JSON under `build/tmp/packs`
- pack to `build/stage/packs`
- include in staged system output

## Versioning and drift control

- Each generated JournalEntry should include:
    - `flags.sohl.sourcePath` = original md path
    - `flags.sohl.sourceHash` = hash of markdown content
- During build, if a journal entry exists with same slug but different hash:
    - overwrite generated output (source of truth is `/docs/user`)

## Manual PDF (future, same source)

Once Markdown conventions are stable, PDF generation can be:

- Pandoc → PDF (or mdbook)
- Use the same front matter for ordering and titles

No additional authoring burden.

## Example document (template)

```md
---
title: "Combat Basics"
slug: "combat-basics"
category: "User Guide"
order: 20
tags: [combat, attacks, defense]
foundry:
    folderId: "7e552e2050880585"
    permissions: "default"
---

# Combat Basics

This section explains the basic combat loop.

## Attacking

1. Open your weapon.
2. Choose a strike mode.
3. Roll.

:::tip
Use the attack dialog to select modifiers.
:::
```
