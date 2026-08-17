# Linking Between Content Notes

See also: [Shortcode Integrity](./shortcode-integrity.md), [Generated Content Tables](./content-tables.md), [Build, Deployment, and Release](../how-to/build-and-deployment.md)

Content notes link to one another with **wikilinks**, never with file paths. One
authored link compiles into a Foundry `@UUID` enricher for the compendium packs
and into an ordinary markdown link for the knowledgebase, so it has to be written
once and be correct in both.

This page is for anyone authoring notes under `assets/content/` — including the
prose that becomes an **item's documentation**. The one thing to internalise is
in [An item and its documentation are two documents](#an-item-and-its-documentation-are-two-documents):
the link that opens a skill's *sheet* is not the link that opens its *write-up*.

## The four forms

| Form | Addresses |
| --- | --- |
| `[[type-shortcode\|Text]]` | a document of that type |
| `[[Text]]` | an alias unique **within the source note's own type** |
| `[[type-shortcode#slug\|Text]]` | a section of that document |
| `[[#slug\|Text]]` | a section of the note you are writing |

The qualifier is the note's **type**, not its directory. `(type, shortcode)` is
the system's logical identity and is unique by rule (see
[Shortcode Integrity](./shortcode-integrity.md)), so an address stays valid when
a note is refiled. There is deliberately no path form.

**The separator is a hyphen, because content is authored in Obsidian.** Obsidian
reads `/` inside a wikilink as a **path** and resolves it against the vault's
folder structure, so a slash-qualified link is a broken link in the editor where
notes are written — no autocomplete, no backlinks, and no warning when a target is
renamed. Every note additionally carries its own `type-shortcode` in frontmatter
`aliases`, which is what lets Obsidian resolve the form natively.

A hyphen qualifies **only when what precedes it is a known type**: note names
contain hyphens too (`Grukar-ahk`), and those keep resolving as aliases. The split
is at the *first* hyphen, so a shortcode may itself contain one. The older
`type/shortcode` form is still resolved, so a link written before the vault
migration does not silently die.

### Every note carries its own address, exactly once

The alias is not decoration and it is not derived: Obsidian resolves a wikilink
against the **files on disk**, so `[[skill-wpnc]]` only resolves in the editor if
the literal string `skill-wpnc` sits in that note's frontmatter `aliases`. A
build-time derivation cannot stand in for it — the editor is not running the
build.

```yaml
---
aliases:
    - Weaponcraft
    - skill-wpnc # ← the note's address
type: skill
shortcode: wpnc
---
```

Write it by hand when you create a note. **Exactly one** address alias is
allowed, and `npm run lint:content-aliases` fails on any note that has none, has
two, or has one that is not its own address. The count is the point: change a
shortcode and leave the old alias behind, and every stale `[[skill-oldcode|…]]`
goes on resolving to the right note — nothing degrades, nothing is reported, and
the tree quietly carries two live addresses for one document until the retired
code is reused and the old links land somewhere else entirely.

Nothing writes these for you. The check reports; you edit the note.

The bare `[[Text]]` form resolves only against aliases of the **source's own
type** — a `doc` reaches another `doc` by name, but not a `skill`. Where two
notes of one type share a name the bare form is ambiguous and resolves to
neither; write the qualified form instead. A link that cannot be resolved is
left as literal text and reported by the build, so a mistake degrades visibly
rather than silently.

**The `|Text` label is optional, and leaving it off means two different things.**
On a qualified link the target is an *address*, so both builds show the target
document's **name**: `[[doc-shock]]` reads as "Shock". On a bare link the target
is already the prose you wrote, so it stands as written — `worsens the [[Shock
State]]` keeps saying "Shock State". Write the label whenever the sentence needs
different words from the document's name.

## An item and its documentation are two documents

An item note produces **two** documents. Its frontmatter becomes an **Item** in
the items pack; its body becomes that item's **item doc** — a JournalEntry in
the journals pack — and the item's description becomes nothing but a pointer to
it (see
[An item's prose compiles to a journal](../how-to/build-and-deployment.md#an-items-prose-compiles-to-a-journal-not-into-the-item)).

Two documents need two addresses. Every item type therefore has a **virtual
`doc<type>` qualifier** naming its documentation:

| Wikilink | Opens |
| --- | --- |
| `[[skill-wpnc]]` | the Weaponcraft **item sheet** |
| `[[docskill-wpnc]]` | the Weaponcraft **write-up**, at its first page |
| `[[docskill-wpnc#crafting]]` | the **`{#crafting}` page** of that write-up |

The prefix works for every item type — `docweapongear-…`, `docmystery-…`,
`doctrauma-…` — and is formed by prefix rather than kept in a list, so a type
added tomorrow is addressable the day it is authored.

**Choose by what you want the reader to see.** Sending someone to
`[[skill-wpnc]]` when you meant "read about weaponsmithing" opens a sheet of
numbers. Sending them to `[[docskill-wpnc]]` opens the prose.

## Anchors, and where they do nothing

A heading carrying `{#slug}` becomes **its own journal page** — that is how a
section can be addressed at all, since a Foundry UUID cannot point inside a page.
Every H1 becomes a page whether or not it is anchored; anchor a heading at any
level when you want an inbound link to reach it.

```markdown
# Crafting {#crafting}
```

**An anchor on an Item, an Actor or a Macro does nothing and is dropped.** Such a
link opens that document's *sheet*, not its documentation, and a sheet has no
sections to address. Only a JournalEntry link opens a journal, at its first page
or at the page an anchor names.

```markdown
[[skill-wpnc#crafting]]      <!-- anchor ignored: opens the item sheet -->
[[docskill-wpnc#crafting]]   <!-- opens the Crafting page of the write-up -->
```

This is the mistake worth knowing about: the first form looks right, resolves
without complaint, and quietly takes the reader somewhere else.

## The knowledgebase reads the same link differently

Deliberately. On the KB an item note renders as a **single page which is its
documentation**, so `doc<type>` and `<type>` are aliases for the same URL and an
anchor on either is an ordinary in-page anchor. In Foundry the two qualifiers
reach two separate documents. Author one link; each build does the right thing
with it.

An author who means to point at the **knowledgebase site itself** — rather than
at a document — writes an ordinary markdown link to its URL.

## What the build checks

`npm run lint:content-aliases` (part of `npm run lint`) enforces that every note
carrying a `type` also carries **exactly one** `type-shortcode` alias, equal to
its own address — see
[Every note carries its own address, exactly once](#every-note-carries-its-own-address-exactly-once).
It verifies and fails; it never rewrites a note. Notes with no `shortcode` are
skipped, since they cannot be link targets at all.

`npm run lint:content-links` (part of `npm run lint`) enforces two things the
compilers cannot:

- **Every `#anchor` link lands on a heading that declares it.** The page id is
  derived by hashing, so a link to an anchor nobody declares would otherwise
  compile cleanly and dead-end.
- **Every `Rules/**` and `User_Guide/**` note is reachable** from its own root by
  following links. An unlinked note still compiles and still publishes; it is
  simply impossible to arrive at by reading.

- **Every qualified `[[type-shortcode]]` resolves to a document.** A dead address
  degrades to plain text and keeps its label, so the prose still reads correctly
  while the link is simply gone — the failure mode that hides best.

Fenced `dataview` tables are expanded before the walk, so a link generated into a
table row counts as a real link on all three counts.

**A bare `[[Name]]` is not an address and is never reported.** Unqualified targets
are the long-standing placeholder for worldbuilding notes kept outside this
repository, and a hyphenated *name* (`[[Grukar-ahk]]`) stays a name, since a hyphen
only qualifies on a known type.

**Addressing another package.** `assets/content/` holds the `sohl` package alone,
but a page may legitimately address material in another — `Rules/Bestiary.md` links
Thalorna creatures, and Bestiary pages cite Thalorna geography. Such an address
resolves through that package's **link manifest**, vendored under
`assets/manifests/<package>.json` and produced by its own build (#1446). Nothing
special is needed to write one: address the note as `type-shortcode` exactly as you
would a local one, and it resolves if the target package publishes it.

An address that resolves in no package — local or vendored — is a typo and fails the
build. That check is live only while every package in `LINK_PACKAGES`
(`utils/kb-manifest.mjs`) is accounted for; if a manifest is missing, unresolved
addresses are tolerated and the build says so, because the distinction is not
decidable without it.

**What a manifest entry records is package-relative** (#1465). An entry is
`{ path, name }`, and `path` says where the page sits *inside its own package*
(`creature/grukar-ahk/`) — never where that package is served. The mount point is
the consuming build's knowledge, held one line per package in `PACKAGE_BASE`
(`utils/kb-manifest.mjs`) and prefixed when the address is resolved, so
`creature-grkrahk` renders as `/thalorna/creature/grukar-ahk/` here.

Repointing a package is therefore that one string — to another path
(`"/setting/thalorna/"`) or another origin (`"https://thalorna.example.org/"`),
after which every inbound link into it follows. A manifest that recorded the mount
point instead would break each of those links the day the package moved, and break
them silently: the address still resolves, an `href` is still emitted, and only the
reader finds the 404. Because the two shapes are indistinguishable to a reader that
just prefixes, the format carries a version and a manifest written to an older one
is rejected rather than read.

This replaced a hand-maintained allowlist of six reviewed addresses (#1414), which
existed only because no manifest could answer the question.

## Developer docs are the exception: they link by path

Everything above concerns notes under `assets/content/`. The developer tree,
`kb/dev-docs/`, links with **relative paths** instead — and cannot use
wikilinks at all. A wikilink resolves by `(type, shortcode)`, which lives in a
note's frontmatter; developer docs have no frontmatter and are deliberately left
out of the link index, so `[[Testing]]` would find nothing and render as literal
text. Relative paths are also what GitHub and an IDE follow, and that tree is
read in the repository at least as often as on the knowledgebase.

A wikilink in a developer doc *pointing at a content note* does work — that
direction resolves normally. It is only dev-doc → dev-doc that has no target.

The cost of a path is that it encodes location: move a page and every link into
it breaks. `npm run lint:doc-links` is what says so, checking that each relative
target exists and that each `#anchor` matches a heading the target declares.
