---
type: doc
subType: reference
name:
  full: Content Creator
  aliases: []
shortcode: contentcreator
description: "The section landing: what a content note is, and which page answers which question."
pack: none
sohl:
  kbcat: devdocs
---

# Content Creator

See also: [[doc-devdocs|Documentation Hub]], [[doc-buildanddeployment|Build, Deployment, and Release]], [[doc-typecatalog|Type Catalog]]

Everything you need to author content in `assets/content/` — without reading the
compiler.

A **content note** is a markdown file with YAML frontmatter. The build turns it
into a Foundry document: an Item, an Actor, a Scene, a Macro, or a JournalEntry.
Nothing about that document is authored as Foundry data — the note carries the
_essence_ of the thing, and the compiler supplies the rest.

This section is for the person writing those notes. It is not about the system's
runtime; if you are changing how a document _behaves_, you want
[[doc-systemdevelopment|System Development]] instead.

## Start here

- [[doc-authoringworkflow|The Authoring Workflow]] — where content lives, the
  frontmatter every note carries whatever its type, and how a note becomes a
  compendium document. **Read this first.**

> **You do not declare a note's package.** It is the repository's configured
> `contentPackage`, and every note in this tree belongs to it. Declaring
> `package:` on a note is a build error. See
> [[doc-authoringworkflow#the-package-is-the-repositorys-not-the-notes|The package is the repository's, not the note's]].

## Per-type references

What frontmatter each kind of note accepts.

- [[doc-itemfrontmatter|Item Note Frontmatter]] — the generated per-type field
  reference for all 13 item types: every `sohl:` field, its shape, whether it is
  required, and what it defaults to.
- [[doc-actornotes|Actor Notes]] — authoring a `being`, and the
  `(type, shortcode)` address space its embedded items are resolved through.
- [[doc-mapnotes|Map Notes]] — authoring a Foundry Scene as a markdown note: the
  `battlemap` / `localmap` / `regionalmap` schema, the two unit conventions,
  regions and their behaviours, and how a map is packaged.
- [[doc-macronotes|Authoring a Macro Content Note]] — how a `type: macro` note
  compiles into a Foundry Macro plus its documentation, and what the `{#script}`
  anchor does.

## Conventions

Rules that apply across every note type.

- [[doc-contentlinks|Linking Between Content Notes]] — wikilinks: the four forms,
  and why an item and its documentation need two different addresses.
- [[doc-assetconventions|Asset Conventions]] — where art files live, how `img:`
  resolves to a shipped path, image formats, and what makes an SVG themeable.
- [[doc-contenttables|Generated Content Tables]] — SQL queries that tabulate
  content notes from their frontmatter.

## Also relevant, filed elsewhere

These are system-facing references rather than authoring guides, but a content
author reaches for them often enough to be worth naming here.

- [[doc-shortcodeintegrity|Shortcode Integrity]] — a type and a
  shortcode together are a **logical identity**, not a lookup convenience. The
  uniqueness rule, the shape rule, and why renaming a shortcode is expensive.
- [[doc-linkmanifest|The Link Manifest]] — how one package's notes
  address another package's documents.
- [[doc-typecatalog|Type Catalog]] — the generated list of every
  Actor and Item type the system defines, with one line each.
