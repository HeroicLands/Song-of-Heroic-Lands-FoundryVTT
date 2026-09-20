---
type: doc
subType: howto
name:
  full: Linking Between Content Notes
  aliases: []
shortcode: contentlinks
description: "Wikilinks for content authors: the three forms, and why an item and its documentation need two different addresses."
pack: none
sohl:
  kbcat: devdocs
---

# Linking Between Content Notes

See also: [[doc-shortcodeintegrity|Shortcode Integrity]], [[doc-contenttables|Generated Content Tables]], [[doc-buildanddeployment|Build, Deployment, and Release]]

Content notes link to one another with **wikilinks**, never with file paths. One
authored link compiles into a Foundry `@UUID` enricher for the compendium packs
and into an ordinary markdown link for the knowledgebase, so it has to be written
once and be correct in both.

This page is for anyone authoring notes under `assets/content/` — including the
prose that becomes an **item's documentation**. The one thing to internalise is
in [An item and its documentation are two documents](#an-item-and-its-documentation-are-two-documents):
the link that opens a skill's _sheet_ is not the link that opens its _write-up_.

## The three forms

| Form                            | Addresses                             |
| ------------------------------- | ------------------------------------- |
| `[[type-shortcode\|Text]]`      | a document of that type               |
| `[[type-shortcode#slug\|Text]]` | a section of that document            |
| `[[#slug\|Text]]`               | a section of the note you are writing |

The qualifier is the note's **type**, not its directory. `(type, shortcode)` is
the system's logical identity and is unique by rule (see
[[doc-shortcodeintegrity|Shortcode Integrity]]), so an address stays valid when
a note is refiled. There is deliberately no path form.

**A bare `[[Text]]` addresses nothing.** There is no namespace of names to look a
target up in, so every link names an address. The build reports a bare link as its
own kind of finding — separate from an address that resolves nowhere, because the
corrections differ — and the fix is always `[[type-shortcode|Text]]`.

**The canonical separator is a hyphen**, and it qualifies **only when what
precedes it is a known type**: note names contain hyphens too (`Grukar-ahk`), and a
target that is one is reported as not being an address rather than split at an
arbitrary place. The split is at the _first_ hyphen, so a shortcode may itself
contain one (`trauma-self-pro` is `trauma` + `self-pro`). The older
`type/shortcode` form is still resolved, so an older link does not silently die; a
slash is _unconditionally_ a qualifier, and the split is at the last one.

A leading **package** segment is optional and outermost — `sohl-skill-lang` is
`skill-lang` in the `sohl` package — and is read only where the resolver is given
the packages it may name, so a note called `Grukar-ahk` is never mistaken for one
.

**The `|Text` label is required, in every form** — an anchor-only link included.
The target is an address, not prose, so without a label there is nothing to
display. Both builds render the words you wrote, so write whatever the sentence
needs, whether or not it matches the document's name.

## An item and its documentation are two documents {#an-item-and-its-documentation-are-two-documents}

An item note produces **two** documents. Its frontmatter becomes an **Item** in
the items pack; its body becomes that item's **item doc** — a JournalEntry in
the journals pack — and the item's description becomes nothing but a pointer to
it (see
[[doc-buildanddeployment#an-items-prose-compiles-to-a-journal-not-into-the-item|An item's prose compiles to a journal]]).

Two documents need two addresses. Every item type therefore has a **virtual
`doc<type>` qualifier** naming its documentation:

| Wikilink                     | Opens                                           |
| ---------------------------- | ----------------------------------------------- |
| `[[skill-wpnc]]`             | the Weaponcraft **item sheet**                  |
| `[[docskill-wpnc]]`          | the Weaponcraft **write-up**, at its first page |
| `[[docskill-wpnc#crafting]]` | the **`{#crafting}` page** of that write-up     |

The prefix works for every item type — `docweapongear-…`, `docmystery-…`,
`doctrauma-…` — and is formed by prefix rather than spelled out at each address,
so a type added tomorrow is addressable the day it is authored.

**A macro note is the same shape.** `[[macro-autoattack]]` opens the Macro;
`[[docmacro-autoattack]]` opens its write-up, and `[[docmacro-autoattack#script]]`
the page holding its source. See
[[doc-macronotes|Authoring a Macro Content Note]].

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
link opens that document's _sheet_, not its documentation, and a sheet has no
sections to address. Only a JournalEntry link opens a journal, at its first page
or at the page an anchor names.

```markdown
[[skill-wpnc#crafting]] <!-- anchor ignored: opens the item sheet -->
[[docskill-wpnc#crafting]] <!-- opens the Crafting page of the write-up -->
```

This is the mistake worth knowing about: the first form looks right, resolves
without complaint, and quietly takes the reader somewhere else.

## Code is verbatim, so a link inside it is not a link

Wikilink conversion skips **code**: a `[[…]]` inside a fenced block (backtick or
tilde fences, of any length, with or without an info string), inside a
four-space indented block, or inside an inline `` `code span` `` is shown to the
reader exactly as written. That is how a note can document the link syntax itself, and it is how a
macro's script survives compilation — `const first = grid[[0]];` is a nested
array literal, not an address, and is left alone in the macro's _documentation_
copy as well as its executable one.

````markdown
```js
const first = grid[[0]];   <!-- left alone: source, not a link -->
```

Write `[[skill-wpnc]]` to link the skill. <!-- shown, not resolved -->
````

Only code is exempt. A wikilink inside a table cell, a blockquote or a list is an
ordinary link, and a `sql` table is expanded _before_ links resolve — so a
generated cell may itself carry one.

## A wikilink belongs in prose, not in frontmatter

Both builds walk a note's **body**. Frontmatter is data: the pack compilers and
the knowledgebase build copy it through untouched, so a wikilink written in one
is never resolved and reaches the reader as literal `[[…]]` — in whatever the
theme renders that field as, an infobox row or a card subtitle. Nothing further
down notices, because the value is a perfectly good string.

```yaml
government:
  summary: A warlord protecting the spawn-chamber of a fertile [[creature-grkrahk|Grukar-ahk]].
```

So the form is **refused rather than resolved**, by `lint:content-links` on every
change and by the knowledgebase build before it writes a page. Resolving it would
mean choosing an output syntax for a field whose renderer the build does not
know — a markdown link is inert in a template that prints the value as text, and
an `<a>` is unusable in one that escapes it — and it would bless an authoring
habit the pack build has no way to honour at all.

Write the value as plain text and put the link in the prose the field summarises:

```yaml
government:
  summary: A warlord protecting the spawn-chamber of a fertile Grukar-ahk.
```

## The knowledgebase reads the same link differently

Deliberately. On the KB an item note renders as a **single page which is its
documentation**, so `doc<type>` and `<type>` are aliases for the same URL and an
anchor on either is an ordinary in-page anchor. In Foundry the two qualifiers
reach two separate documents. Author one link; each build does the right thing
with it.

An author who means to point at the **knowledgebase site itself** — rather than
at a document — writes an ordinary markdown link to its URL.

## What the build checks

`npm run lint:addresses` (part of `npm run lint`) enforces the identity rules a
link depends on: a `shortcode` is lowercase alphanumeric, `(type, shortcode)` names one
note, and exactly one note claims the package's own address. It verifies and fails;
it never rewrites a note.

`npm run lint:content-links` (part of `npm run lint`) enforces several things the
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

- **No wikilink is authored in frontmatter.** Both builds copy frontmatter to
  the page verbatim, so the link never resolves and the reader is shown the
  brackets — see
  [A wikilink belongs in prose, not in frontmatter](#a-wikilink-belongs-in-prose-not-in-frontmatter).
  The knowledgebase build refuses it as well, so it cannot publish that way even
  if the lint is bypassed.

**A withdrawn hostname is not checked here.** The checks above read wikilinks,
so an absolute URL passes through all of them untouched. The guard sits where
the risk is instead: `utils/build-site.mjs` repairs withdrawn hrefs in the
_generated_ site and refuses to publish one it cannot repair. The list lives in
`utils/retired-hosts.mjs`, and adding a host there is what withdraws it.

Fenced `sql` tables are expanded before the walk, so a link generated into a
table row counts as a real link on all the wikilink counts.

**A bare `[[Name]]` is not an address and is never reported.** Unqualified targets
are the long-standing placeholder for worldbuilding notes kept outside this
repository, and a hyphenated _name_ (`[[Grukar-ahk]]`) stays a name, since a hyphen
only qualifies on a known type.

**Addressing another package — not from here.** `assets/content/` holds the `sohl`
package alone, and **`sohl` is the base: nothing it ships may address another
package**. Modules depend on the system; the system depends on nothing, so
the package graph is a tree rather than a cycle. Every address you write in this
repository resolves within this repository.

The dependency runs the other way. `sohl-thalorna` and `sohl-kethira-basic` address
`sohl`, declaring it in `relationships` with `itemCatalog: true` and filling a local
cache with `content-build deps fetch`; a compile never touches the network, and one
whose cache is cold fails saying so. That is the mechanism a _consuming_ repository
uses — this one is on the other end of it.

An address that resolves in no package is a typo and **fails the build**:

```text
Bestiary/Animal/Giraffe.md:337:29: error: address [[doc-xerathia]] resolves to no note — no package publishes it.
```

`npm run lint:content-links` (part of `npm run lint`, so it gates every build) is
what enforces it. Because this repository declares no dependency, that check is
also what keeps the base package free of outbound references: a link into a module
resolves nowhere and stops the build.

**What a manifest entry records is package-relative**. An entry is
`{ path, name }`, and `path` says where the page sits _inside its own package_
(`creature/grukar-ahk/`) — never where that package is served. The mount point is
the consuming build's knowledge, held one line per package in `PACKAGE_BASE`
(`@heroiclands/package-build/engine/kb-manifest`) and prefixed when the address is resolved, so
`creature-grkrahk` renders as `/thalorna/creature/grukar-ahk/` here.

Repointing a package is therefore that one string — to another path
(`"/setting/thalorna/"`) or another origin (`"https://thalorna.example.org/"`),
after which every inbound link into it follows. A manifest that recorded the mount
point instead would break each of those links the day the package moved, and break
them silently: the address still resolves, an `href` is still emitted, and only the
reader finds the 404. Because the two shapes are indistinguishable to a reader that
just prefixes, the format carries a version and a manifest written to an older one
is rejected rather than read.

This replaced a hand-maintained allowlist of six reviewed addresses, which
existed only because no manifest could answer the question.

## Developer documentation links the same way

The developer documentation under `assets/content/Dev_Docs/` is a tree of
`doc` notes like any other — each carries a `shortcode`, and `pack: none` says
it compiles into no Foundry document — so a page there is addressed
`[[doc-<shortcode>|Text]]` and checked by `npm run lint:content-links` with the
rest of the corpus. A link into a section of one names an anchor the heading
declares: `[[doc-architecture#phase-batched-lifecycle|Phase-batched lifecycle]]`
resolves only because that heading carries `{#phase-batched-lifecycle}`.

The one link class those pages carry that the rest of the tree does not is a
**repository-relative path** to a source file — `../../../../src/…`, read on
GitHub and in an editor. Such a link is a plain markdown link, not a wikilink,
and no build checks it; on the published page it goes nowhere.
