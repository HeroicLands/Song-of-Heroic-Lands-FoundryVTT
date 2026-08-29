# The Authoring Workflow

See also: [Content Creator](README.md), [Linking Between Content Notes](content-links.md), [Build, Deployment, and Release](../how-to/build-and-deployment.md)

A **content note** is a markdown file with YAML frontmatter, and the build turns
it into a Foundry document. Nothing about that document is authored as Foundry
data: the note carries the _essence_ of the thing — its identity, its name, the
handful of numbers the game rules care about, and the prose a reader wants — and
the compiler supplies everything else, from `_stats` stamps to embedded document
keys.

This page is the orientation. It covers where notes live, the frontmatter every
note carries whatever its type, and the path from a file on disk to an entry in a
compendium pack. It deliberately does not enumerate fields: what a `weapongear`
or a `being` accepts belongs to
[Item Note Frontmatter](item-frontmatter.md) and [Actor Notes](actor-notes.md).

## Where content lives

Every note in this repository sits under `assets/content/`, which is **this
repository's source** — edited here directly, not exported from anywhere. The
tree holds 1,457 notes today, dominated by gear and injuries:

| `type:`         | Notes | `type:`           | Notes |
| --------------- | ----: | ----------------- | ----: |
| `miscgear`      |   387 | `affliction`      |    34 |
| `armorgear`     |   311 | `projectilegear`  |    18 |
| `trauma`        |   236 | `attribute`       |    16 |
| `doc`           |   128 | `mysticalability` |     9 |
| `being`         |    95 | `battlemap`       |     2 |
| `weapongear`    |    82 | `regionalmap`     |     1 |
| `skill`         |    73 | `macro`           |     1 |
| `containergear` |    64 |                   |       |

The directory is opened as an **Obsidian vault**. That is not incidental: it is
why wikilinks are hyphen-separated and why every note carries its own address in
`aliases:` (see [Linking Between Content Notes](content-links.md)), and it is why
[Dataview](content-tables.md) tables render live while you author — a collection
page shows the notes it collects as you edit them, rather than only after a
build. The vault's `Templates/` directory is templater scaffolding and is
excluded from every compile pass.

## The shared envelope

Every note, of every type, carries the same frontmatter envelope. Only the nested
`sohl:` block varies by type.

```yaml
---
aliases:
  - skill-ritual # the note's own address; see content-links.md
name:
  full: Ritual
description: "Conducting ceremonies, rites, and worship services."
id: K7tJynLhxSDiajCo
img: icons/game-icons/delapouite/circle.svg
shortcode: ritual
type: skill
folder: IY7snVGTGcpTxofH
sohl:
  archetype: 0
  subType: ritual
  skillBaseFormula: "sb(attr.wil, attr.rea)"
---
Prose goes here, and becomes this skill's write-up.
```

| Field        | Required         | What it decides                              |
| ------------ | ---------------- | -------------------------------------------- |
| `type:`      | yes              | Which compiler claims it                     |
| `id:`        | yes¹             | The Foundry document `_id`                   |
| `shortcode:` | for link targets | The note's logical identity, and its address |
| `aliases:`   | yes¹             | That address, resolvable inside Obsidian     |
| `name.full`  | in practice      | The document's name, and its published URL   |
| `folder:`    | no               | Which compendium folder the document sits in |
| `img:`       | no               | The document's artwork                       |
| `draft:`     | no               | Withholds the note from everything           |
| `pack:`      | no               | Which compendium of its type receives it     |
| `sohl:`      | by type          | The type-specific fields                     |

¹ `id:` is fatal for every pass but Journals; the address alias is required of
every note that carries a `shortcode`. Both are explained below.

**The order the compiler applies these is load-bearing**, because it decides
which mistake produces which symptom. Each pass walks the whole content tree once
and tests, in this order: whether the type is retired, then whether this pass
claims the type at all, then `draft:`, then `id:`, then `pack:`, then the pass's
own rejection rules. A note rejected early never reaches the checks that would
have explained it.

## The package is the repository's, not the note's

A note does **not** declare which distribution owns it. Its package is the
`contentPackage` this repository configures — `sohl`, declared in
`package-build.config.yaml` — and every note in this tree belongs to it. There is
nothing to author and nothing to keep in sync.

That is a deliberate retirement (HeroicLands/package-build#56). A note used to
carry `package:`, and the compile loop read it as a **selector**: any note whose
value did not match the configured one was skipped, silently, at `log.debug`
below the CLI's `info` floor. The note compiled nothing, said nothing, and the
build exited 0 — indistinguishable from a note that did not exist. A whole tree
labelled for a package no configuration answered to compiled **zero** documents
and still reported success, which is the state `sohl-kethira-basic` was in with
235 of its 363 notes mislabelled (#1513).

Deriving the package removes the failure mode outright rather than guarding
against it: there is no value to disagree with. A note that still declares
`package:` is now a named build error rather than a quiet skip, and this
repository carries none (#1745).

**A note you just wrote did not appear in the pack?** Check `type:` — since the
package can no longer be wrong, an unclaimed type is the remaining way to be
skipped in silence.

## `type:` selects the compiler, never the pack

`type:` says what kind of thing the note is, and thereby which compile pass
claims it — items, actors, journals, macros or scenes. It does not choose a
compendium; that is `pack:`, and the two are orthogonal.

**Retired types throw.** `character` and `creature` were merged into the single
`being` they had always compiled into (#1580), and the retired names are kept in
the toolchain rather than deleted so that a note still carrying one fails with a
message naming the replacement: _"Both compiled to the same document, so the fix
is mechanical: write `being`."_ Deleting them would have been the quiet failure —
an unrecognised type falls through to the open item set, so `creature` would have
been routed to the items pack, silently and wrongly.

**An unknown type that is not retired is claimed by no pass and skipped in
silence.** Now that the package is derived rather than declared, this is the one
frontmatter typo that still makes a note vanish without a word — check `type:`
first when a note does not appear.

The types this system defines are listed in the
[Type Catalog](../reference/type-catalog.md).

## `id:` is the document's identity, and it is pinned by hand

`id:` is a 16-character Foundry id, authored in the note and used **verbatim** as
the compiled document's `_id` and its LevelDB `_key`. It is pinned rather than
generated because a Foundry id is what every `@UUID` link, every world's imported
copy, and every embedded reference resolves through: regenerate it and every
inbound link dies.

A missing `id:` is **fatal** for every pass except Journals, where
`static requiresId = false` — an unidentified journal note is prose that simply
never became an entry, warned about and skipped.

**There is no format guard and no cross-note uniqueness guard on `id:`.** Nothing
checks that the string is 16 characters, and nothing checks that two notes do not
claim the same one. A duplicate surfaces only as an opaque LevelDB key collision
at compile time, naming a key rather than the two notes that fought over it. Copy
a note to start a new one and the first thing to change is its `id:`.

## `name:` and the published URL

Display names resolve through one helper: `name.full` wins, then a scalar
`name:`, then the literal string `"Unnamed"`. Nothing errors on a missing name —
a nameless note compiles cleanly and ships as "Unnamed".

**The published URL derives from `name.full`, never from an authored slug.** That
is the one derivation rule every surface downstream of the content tree shares,
so a note's knowledgebase address follows its name and there is no second place
to keep in sync.

## Shortcodes: the identity key

`shortcode:` is the note's identity within its type, and half of the
`type-shortcode` address a wikilink uses. Two rules govern it:

- **Shape.** `^[A-Za-z0-9]+$` — ASCII letters and digits only (#1397). The
  hyphen is excluded because it is the wikilink separator, and the parse depends
  on the separating hyphen being the only one in the string. Case is deliberately
  **not** constrained: 418 authored shortcodes are mixed-case and collide with
  nothing.
- **Uniqueness.** `(type, shortcode)` is unique within a pack (#766).

**Both are enforced by `npm run lint:addresses`, not by the pack compile.** The
compile will happily emit two documents sharing an address; the lint is what
refuses it. Run it before you commit.

Renaming a shipped shortcode is expensive, and worth understanding before you
choose one. The address is not a lookup convenience — it is a logical identity
that existing worlds have already stored, so a rename needs a world migration on
top of the edits to every note that links to it. See
[Shortcode Integrity](../reference/shortcode-integrity.md) for the identity
semantics and the migration path.

## `aliases:` — the address, written by hand

Every content note carries **exactly one** `type-shortcode` alias, matched
case-sensitively:

```yaml
aliases:
  - Weaponcraft # a display name
  - skill-wpnc # ← the note's address
```

Obsidian resolves a wikilink against the files on disk, so the address only
resolves in the editor if the literal string sits in that note's `aliases`. A
build-time derivation cannot stand in for it — the editor is not running the
build. `npm run lint:addresses` fails on a note with none, with two, or
with one that is not its own address; the exactness is the point, since a stale
alias left behind after a rename keeps resolving and reports nothing.

Any other aliases are display names, and are merged into wikilink resolution
along with the note's filename with `_` read as a space. See
[Linking Between Content Notes](content-links.md).

## Folders

`folder:` is optional and defaults to `null` — a document at the pack's root. Its
value is a **folder id** declared in a `*-folders.yaml` file at the content root,
one per configured pack:

```
assets/content/item-folders.yaml
assets/content/journal-folders.yaml
assets/content/actor-folders.yaml
assets/content/macro-folders.yaml
assets/content/scene-folders.yaml
```

Each entry declares `name` (required), `id` (required, a stable 16-character id),
`parentFolderId` (required, `""` for a top-level folder) and an optional `color`.
Sibling folders must have unique names; cousins under different parents may share
one, since a note references the specific folder's id.

**An undeclared id is an error** — `Unknown folder id "<id>"`, reported as a
diagnostic naming the note that carried it. The value is read through `sohlField`,
so `sohl.folder` wins over a top-level `folder:`, though all 1,352 SoHL
declarations are top-level.

**One case escapes that validation, and it is worth knowing.** A doc-carrying
note's derived JournalEntry is filed exactly where the document it describes is,
so the journals pass copies the item note's folder id **without** validating it —
deliberately, because that id is declared in `item-folders.yaml`, which is not the
journals pack's own file. The consequence is that `journal-folders.yaml` must
independently declare the ids the item tree uses, or those documentation entries
land under a folder no journals pack declares.

## Drafts withhold a note from everything

`draft: true` removes the note from the compendium packs, from the
[link manifest](../reference/link-manifest.md), and from the knowledgebase and
site — the last because Hugo's own default excludes drafts and `build:kb` passes
no `--buildDrafts`. Net: **a draft ships nowhere.**

The pack skip is silent per note, though the pass does report a count
(`Skipped N draft(s)`), which is enough to notice that something is being held
back. No SoHL note currently uses it.

## `pack:` — which compendium receives the document

`pack:` is optional (#1566) and names which compendium **of the note's own
document type** receives it. A type with exactly one configured pack needs no
declaration, which is why no SoHL note carries one today: this repository
declares one pack per document type.

**Do not confuse it with the note's _package_.** The package is the
_distribution_ that owns the note, and it is no longer authored at all — it is
the repository's configured `contentPackage`. `pack:` says which _compendium_
receives the note's document, and it is the only one of the two a note ever
declares. Every wrong `pack:` is a build error naming the note and the
candidates.

The router refuses, by name, a `pack:` that:

- no configured pack answers to (the message lists the packs of that type);
- holds documents of a different type from the note's;
- is a **companion** pack — written by another pass, so no note may route into
  one; or
- is absent when several packs of that type exist and none is marked default.

**Derived documents ignore it.** An item's documentation lands in the default
JournalEntry pack whatever Item pack the item itself was routed to: the
declaration names where the note's _own_ document goes, and a pass writing a
document derived from it is not what the author was addressing.

## The `sohl:` block

Type-specific fields live under a nested `sohl:` key, read through `sohlField`,
which looks in `sohl.<key>` first (dotted paths work) and falls back to the top
level. Two members are near-universal:

- **`sohl.archetype` is required on every item and actor note.** It is a number
  (this _is_ an archetype, at that priority) or `null` (it is not). Absent or
  malformed, it throws — _"set a number (this is an archetype) or null (it is
  not)"_ — because the distinction cannot be defaulted without guessing.
- **`sohl.folder`**, as above.

Everything else is per-type, and is documented per type:
[Item Note Frontmatter](item-frontmatter.md),
[Actor Notes](actor-notes.md), [Map Notes](map-notes.md), and
[Authoring a Macro Content Note](macro-notes.md). `img:` resolution is its own
page — see [Asset Conventions](asset-conventions.md).

## Prose becomes a journal

This is the surprising one. An item note's **body** is documentation, not the
item's description field, so it compiles into a **JournalEntry** in the journals
pack — and the item's `system.docHtml` becomes nothing but a `@UUID` link to that
entry's first page (#1356).

**"Nothing else" is the whole convention.** A description that is only a link is
unmistakably a pointer; anything alongside it would make the field ordinary prose
that the runtime shows verbatim, and the two would drift. So the pointer stands
alone, labelled with the item's name so that a target which ever fails to resolve
degrades to a named broken link rather than a bare UUID.

Two passes write those two documents, and they share no state: the items pass
writes the pointer, the journals pass writes the entry, and both derive the same
ids from the item note's own `id:` — the entry's id is a hash of it, in a frozen
`"item-doc"` namespace, so the two are distinct documents whose UUIDs are never
ambiguous.

The rule applies to every item type plus `macro` and the three map types. It does
**not** apply to `doc` notes or `being` actors: each of those is a single
document, whose body is its own content. A note with no prose gets no
documentation entry, and the exclusion is applied identically on both sides, so
the pointer and the entry always agree about whether there is one.

**Pages split on an H1, or on any heading carrying an `{#anchor}` suffix** — at
any level. A Foundry UUID can only address a page, so a section that wants to be
linkable has to be one. A repeated anchor within a note is an error. Prose before
the first heading becomes a lead page.

Because the item and its write-up are two documents, they need two addresses:
`[[skill-wpnc]]` opens the sheet, `[[docskill-wpnc]]` opens the write-up. See
[An item and its documentation are two documents](content-links.md#an-item-and-its-documentation-are-two-documents)
and
[An item's prose compiles to a journal, not into the item](../how-to/build-and-deployment.md#an-items-prose-compiles-to-a-journal-not-into-the-item).

## The pipeline

`assets/content/` → `build/packs-json/<pack>/` → `build/stage/packs/<pack>/`.

| Stage | Command                          | Output                              |
| ----- | -------------------------------- | ----------------------------------- |
| 1     | `npm run build:compiledb`        | `build/packs-json/<pack>/` JSON     |
| 2     | (the same command's second half) | `build/stage/packs/<pack>/` LevelDB |

`build:compiledb` is `content-build package compile`, the content pipeline
itself. The wider `build:db` runs `build:assets`, then `build:compiledb`, then
`build:link-manifest`.

Stage 1 writes **one JSON file per document** into `build/packs-json/`. That
directory is a disposable build intermediate — never committed — and each pack's
directory is wiped and recreated on every run, so a note you deleted leaves no
stale JSON behind to be compiled into the pack anyway.

**Stage 2 refuses to run if stage 1 reported any error.** The compile stops with
_"refusing to compile packs from incomplete output"_ rather than shipping a pack
that is quietly missing whatever failed. That refusal is the reason a build error
is worth reading in full: it is the last point at which the pipeline still knows
which note caused it.

## What to run before you commit

Three lints answer questions the compilers cannot, and all three are part of
`npm run lint`:

- **`npm run lint:addresses`** — the shortcode shape and `(type, shortcode)`
  uniqueness rules. Not enforced by the compile.
- **`npm run lint:addresses`** — every note carrying a `type` also carries
  exactly one address alias equal to its own address.
- **`npm run lint:content-links`** — every wikilink resolves, every `#anchor`
  lands on a heading that declares it, and no wikilink is authored in
  frontmatter.

None of them rewrites a note: they report, and you edit. Beyond that, the
repository's ordinary gates apply — see
[System Development](../contributing/system-development.md) for the definition of
done, and [Build, Deployment, and Release](../how-to/build-and-deployment.md) for
what the full pipeline does with the packs once they compile.
