---
type: doc
subType: howto
name:
  full: The Authoring Workflow
  aliases: []
shortcode: authoringworkflow
description: "Where content lives, the frontmatter every note carries whatever its type, and how a note becomes a compendium document."
pack: none
sohl:
  kbcat: devdocs
---

# The Authoring Workflow

See also: [[doc-contentcreator|Content Creator]], [[doc-contentlinks|Linking Between Content Notes]], [[doc-buildanddeployment|Build, Deployment, and Release]]

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
[[doc-itemfrontmatter|Item Note Frontmatter]] and [[doc-actornotes|Actor Notes]].

## Where content lives

Every note in this repository sits under `assets/content/`, which is **this
repository's source** — edited here directly, not exported from anywhere. The
tree is dominated by gear and injuries, with the rest spread across skills,
beings, documentation and the structural notes that file them.

Which `type:` values exist is the
[[doc-typecatalog|Type Catalog]]; what each one carries is set out
per kind: [[doc-itemfrontmatter|items]], [[doc-actornotes|actors]],
[[doc-mapnotes|maps]] and [[doc-macronotes|macros]].

Notes are plain Markdown with YAML frontmatter, edited in whatever editor you
prefer; nothing about the tree depends on a particular one. A note declares
[[doc-contenttables|what it wants tabulated]] rather than carrying a hand-written
table, and the build fills the rows in.

## The shared envelope

Every note, of every type, carries the same frontmatter envelope. Only the nested
`sohl:` block varies by type.

```yaml
---
name:
  full: Ritual
description: "Conducting ceremonies, rites, and worship services."
img: icons/game-icons/delapouite/circle.svg
shortcode: ritual
type: skill
packFolder: mysticalskills
sohl:
  archetype: 0
  subType: ritual
  skillBaseFormula: "sb(attr.wil, attr.rea)"
---
Prose goes here, and becomes this skill's write-up.
```

| Field         | Required         | What it decides                                             |
| ------------- | ---------------- | ----------------------------------------------------------- |
| `type:`       | yes              | Which compiler claims it                                    |
| `id:`         | no¹              | Pins the Foundry document `_id`, which is otherwise derived |
| `shortcode:`  | for link targets | The note's logical identity, its address, and its URL       |
| `name.full`   | in practice      | The document's name                                         |
| `packFolder:` | no               | Which folder note files the document                        |
| `img:`        | no               | The document's artwork                                      |
| `pack:`       | no               | Which compendium of its type receives it                    |
| `sohl:`       | by type          | The type-specific fields                                    |

¹ No note in this tree authors one. `id:` is an escape hatch, explained below.

**The order the compiler applies these is load-bearing**, because it decides
which mistake produces which symptom. Each pass walks the whole content tree once
and tests, in this order: first the **refused frontmatter fields** — `package:`,
`draft:`, `aliases:`, `section:`, each rejected by name — then whether the
`type:` is one of the refused names, then whether this pass claims the type at
all, then whether the note has an **address** to derive an id from, then
`pack:`, then the pass's own rejection rules. A note rejected early never
reaches the tests after it.

## The package is the repository's, not the note's {#the-package-is-the-repositorys-not-the-notes}

A note does **not** declare which distribution owns it. Its package is the
`contentPackage` this repository configures — `sohl`, declared in
`package-build.config.yaml` — and every note in this tree belongs to it. There is
nothing to author and nothing to keep in sync.

A note that declares `package:` is a named build error. Deriving the package
rather than reading it means there is no value for a note to disagree with.

**A note you just wrote did not appear in the pack?** Check `type:` — an
unclaimed type is the one way left to be skipped in silence.

## `type:` selects the compiler, never the pack

`type:` says what kind of thing the note is, and thereby which compile pass
claims it — items, actors, journals, macros or scenes. It does not choose a
compendium; that is `pack:`, and the two are orthogonal.

**`character` and `creature` throw.** Both name what is
`being`, and a note carrying either fails with a message naming the
replacement: _"Both compiled to the same document, so the fix is mechanical:
write `being`."_

**An unknown type is claimed by no pass and skipped in silence.** It is the one frontmatter typo that makes a note vanish without a
word — check `type:` first when a note does not appear.

The types this system defines are listed in the
[[doc-typecatalog|Type Catalog]].

## The document's identity is derived from its address

A note does **not** author its Foundry id. The compiled document's `_id` — and
its LevelDB `_key` — is derived from the canonical address the note already has:

```
_id = makeId("document", "<package>-<system>-<type>-<shortcode>")
```

So a note's identity is the same thing its address is, spelled once. The
address is the identity the build already guards — `content-lint` refuses a
duplicate `(type, shortcode)` across every pack of a document type, which is
exactly the scope a document's id must be unique within — so the derived id
carries that guarantee.

**A folder is not a primary document.** A `type: folder` note derives under its
own namespace, over its own address form — `makeId("folder", "<package>-none-folder-<shortcode>")`
— so that a folder and an item sharing a shortcode cannot silently collide.

**What is fatal is having no address.** A note with no `type:` or no
`shortcode:` is not addressable, so there is nothing to derive from and nothing
for a link to point at. Every pass but Journals refuses it; Journals
(`static requiresId = false`) warns and skips, so unaddressed prose is simply
prose that never became an entry.

**Copying a note to start a new one, the first thing to change is its
`shortcode:`** — that is what makes it a different document now. Leave the
shortcode and you have not copied a note, you have written the same one twice,
and the address lint says so by name rather than leaving an opaque key collision
to be decoded.

### Pinning an `id:`, and the one reason to

An authored `id:` **always wins**. It stays available as an escape hatch for the
one case the derivation cannot serve: a document that must keep its identity
**across a shortcode rename**. Because the address carries the shortcode,
renaming one moves the derived id, where an authored id survived it — a real
trade rather than a free win. A rename already breaks every wikilink to the
note, so it is a breaking change either way; where the document's _identity_
must nonetheless survive, pin the id it had, and say in a comment why.

Pin nothing otherwise. No note in this tree pins an id today.

## `name:` — the display name

Display names resolve through one helper: `name.full` wins, then a scalar
`name:`, then the literal string `"Unnamed"`. Nothing errors on a missing name —
a nameless note compiles cleanly and ships as "Unnamed".

**The name is display only, and reaches no address.** A note's URL is built from
`(type, shortcode)`, so retitling a note moves nothing: no link to repoint, no
redirect to write. Say what the thing is called and change your mind freely.

The nested `name.aliases` is **reserved** — held for a use that does not exist
yet. Nothing consults it: no index, no resolver, no lint rule, no emitter. A note
carrying one compiles, resolves and publishes exactly as if it were absent.

## Shortcodes: the identity key

`shortcode:` is the note's identity within its type, and half of the
`type-shortcode` address a wikilink uses. Two rules govern it:

- **Shape.** `^[A-Za-z0-9]+$` — ASCII letters and digits only. The
  hyphen is excluded because it is the wikilink separator, and the parse depends
  on the separating hyphen being the only one in the string. Case is **not**
  constrained; mixed-case shortcodes are fine.
- **Uniqueness.** `(type, shortcode)` is unique within a pack.

**Both are enforced by `npm run lint:addresses`, not by the pack compile.** The
compile will happily emit two documents sharing an address; the lint is what
refuses it. Run it before you commit.

The shortcode is a **public** address as well as an internal one: the note
publishes at `/<package>/<type>-<shortcode>/`.

Renaming a shipped shortcode is expensive, and worth understanding before you
choose one. The address is not a lookup convenience — it is a logical identity
that existing worlds have already stored, so a rename needs a world migration on
top of the edits to every note that links to it. See
[[doc-shortcodeintegrity|Shortcode Integrity]] for the identity
semantics and the migration path.

## Folders

**A folder is a note**, written and addressed like any other, which is what
lets the compiler follow the index for it as it does for everything else.

```yaml
---
name:
  full: "Physical"
shortcode: traumaphysical
type: folder
data:
  parent: trauma
  color: "#B22222"
---
```

A folder note declares its `shortcode`, an optional `data.parent` naming the
folder above it, and an optional `data.color`. It carries **no prose**: a folder
is structure rather than content, so it wants no documentation journal.

A note says which folder it belongs to with `packFolder:`, naming a folder note's
shortcode:

```yaml
packFolder: traumaphysical
```

Three things follow from a folder being a note:

- **`parent` is an address**, resolved and checked like every other reference. A
  parent that names nothing is an ordinary dead-address finding.
- **Where a folder materialises is derived from what points at it.** A
  documentation journal is filed beside the item it describes, so a pack cannot
  fail to declare a folder something in it points at.
- **The Foundry id is derived from the address**, the way a page id is hashed
  from its anchor. An authored `id:` takes precedence.

## An unfinished note is tagged, not withheld

A note that is written but not finished carries the `draft` tag. The build
ignores it: the note compiles, validates, publishes and resolves like any other,
and it is in the packs, in the link manifest and on the site. What the tag
changes is only how a link _into_ it looks — both builds wrap such a link in a
`sohl-draft-link` marking with the link live inside, so a reader can tell the
target is unwritten. See
[[doc-linkmanifest#links-into-a-draft-note|Links into a draft note]].

A `draft:` **frontmatter field** is refused by name. Withholding a note silently
made every wikilink into it read as a link to a note that does not exist, and hid
any compile error the note carried.

## `pack:` — which compendium receives the document

`pack:` is optional and names which compendium **of the note's own
document type** receives it. A type with exactly one configured pack needs no
declaration, which is why no SoHL note carries one today: this repository
declares one pack per document type.

**Do not confuse it with the note's _package_.** The package is the
_distribution_ that owns the note, and a note never authors it — it is the
repository's configured `contentPackage`. `pack:` says which _compendium_
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
- **`packFolder`**, as above.

Everything else is per-type, and is documented per type:
[[doc-itemfrontmatter|Item Note Frontmatter]],
[[doc-actornotes|Actor Notes]], [[doc-mapnotes|Map Notes]], and
[[doc-macronotes|Authoring a Macro Content Note]]. `img:` resolution is its own
page — see [[doc-assetconventions|Asset Conventions]].

## Prose becomes a journal

This is the surprising one. An item note's **body** is documentation, not the
item's description field, so it compiles into a **JournalEntry** in the journals
pack — and the item's `system.docHtml` becomes nothing but a `@UUID` link to that
entry's first page.

**"Nothing else" is the whole convention.** A description that is only a link is
unmistakably a pointer; anything alongside it would make the field ordinary prose
that the runtime shows verbatim, and the two would drift. So the pointer stands
alone, labelled with the item's name so that a target which ever fails to resolve
degrades to a named broken link rather than a bare UUID.

Two passes write those two documents, and they share no state: the items pass
writes the pointer, the journals pass writes the entry, and both derive the same
ids from the item's own document id — the entry's id is a hash of it, in a frozen
`"item-doc"` namespace, so the two are distinct documents whose UUIDs are never
ambiguous. Neither pass can see the other's answer; they agree because both ask
the same function what the note's document id is.

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
[[doc-contentlinks#an-item-and-its-documentation-are-two-documents|An item and its documentation are two documents]]
and
[[doc-buildanddeployment#an-items-prose-compiles-to-a-journal-not-into-the-item|An item's prose compiles to a journal, not into the item]].

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

Two lints answer questions the compilers cannot, and both are part of
`npm run lint`:

- **`npm run lint:addresses`** — the shortcode shape and `(type, shortcode)`
  uniqueness rules, and that exactly one note claims the package's own address.
  None of it is enforced by the compile.
- **`npm run lint:content-links`** — every wikilink resolves, every `#anchor`
  lands on a heading that declares it, and no wikilink is authored in
  frontmatter.

None of them rewrites a note: they report, and you edit. Beyond that, the
repository's ordinary gates apply — see
[[doc-systemdevelopment|System Development]] for the definition of
done, and [[doc-buildanddeployment|Build, Deployment, and Release]] for
what the full pipeline does with the packs once they compile.
