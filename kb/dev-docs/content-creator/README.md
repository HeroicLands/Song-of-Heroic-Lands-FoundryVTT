# Content Creator

See also: [Documentation Hub](../README.md), [Build, Deployment, and Release](../how-to/build-and-deployment.md), [Type Catalog](../reference/type-catalog.md)

Everything you need to author content in `assets/content/` — without reading the
compiler.

A **content note** is a markdown file with YAML frontmatter. The build turns it
into a Foundry document: an Item, an Actor, a Scene, a Macro, or a JournalEntry.
Nothing about that document is authored as Foundry data — the note carries the
_essence_ of the thing, and the compiler supplies the rest.

This section is for the person writing those notes. It is not about the system's
runtime; if you are changing how a document _behaves_, you want
[System Development](../contributing/system-development.md) instead.

## Start here

- [The Authoring Workflow](authoring-workflow.md) — where content lives, the
  frontmatter every note carries whatever its type, and how a note becomes a
  compendium document. **Read this first.**

> **The failure that catches everyone.** A note whose `package:` does not match
> the repository's configured content package is **skipped in silence** — it
> compiles nothing and says nothing. If a note you just wrote does not appear in
> the pack, check `package:` before anything else. See
> [Why `package:` matters](authoring-workflow.md#why-package-matters).

## Per-type references

What frontmatter each kind of note accepts.

- [Item Note Frontmatter](item-frontmatter.md) — the generated per-type field
  reference for all 13 item types: every `sohl:` field, its shape, whether it is
  required, and what it defaults to.
- [Actor Notes](actor-notes.md) — authoring a `being`, and the
  `(type, shortcode)` address space its embedded items are resolved through.
- [Map Notes](map-notes.md) — authoring a Foundry Scene as a markdown note: the
  `battlemap` / `localmap` / `regionalmap` schema, the two unit conventions,
  regions and their behaviours, and how a map is packaged.
- [Authoring a Macro Content Note](macro-notes.md) — how a `type: macro` note
  compiles into a Foundry Macro plus its documentation, and what the `{#script}`
  anchor does.

## Conventions

Rules that apply across every note type.

- [Linking Between Content Notes](content-links.md) — wikilinks: the four forms,
  and why an item and its documentation need two different addresses.
- [Asset Conventions](asset-conventions.md) — where art files live, how `img:`
  resolves to a shipped path, image formats, and what makes an SVG themeable.
- [Generated Content Tables](content-tables.md) — Dataview `TABLE` queries that
  tabulate content notes from their frontmatter.

## Also relevant, filed elsewhere

These are system-facing references rather than authoring guides, but a content
author reaches for them often enough to be worth naming here.

- [Shortcode Integrity](../reference/shortcode-integrity.md) — a type and a
  shortcode together are a **logical identity**, not a lookup convenience. The
  uniqueness rule, the shape rule, and why renaming a shortcode is expensive.
- [The Link Manifest](../reference/link-manifest.md) — how one package's notes
  address another package's documents.
- [Type Catalog](../reference/type-catalog.md) — the generated list of every
  Actor and Item type the system defines, with one line each.
