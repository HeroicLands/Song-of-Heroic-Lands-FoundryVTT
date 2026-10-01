---
shortcode: linkmanifest
name: {full: The Link Manifest, aliases: []}
type: doc
subType: reference
description: "Cross-package link resolution: each package's own content index, fetched by its consumers, and how a wikilink into another package finds the entry it names."
data: {pack: none}
sohl: {kbcat: devdocs}
---

# The Link Manifest

See also: [[doc-contentlinks|Linking Between Content Notes]], [[doc-shortcodeintegrity|Shortcode Integrity]], [[doc-buildanddeployment|Build, Deployment, and Release]]

Each content package is single-sourced in the repository that ships it, so a note
in one package citing a note in another needs a shared index to resolve
against. Resolution runs through the **content index**: every package
publishes its own, and a consumer fetches the ones it depends on. There is no
separate manifest file that one repository vendors a copy of another's — the
content index already carries every address, Foundry UUID and anchor a
cross-package link needs.

**`package-build manifest` is a different command and generates a different
file.** It writes the Foundry package manifest (`system.json` / `module.json`)
that ships inside the package, from `packageBuild.manifest` configuration. It
has no part in link resolution.

This page is the **contract** for how a link into another package resolves.
Treat every rule below as load-bearing rather than descriptive. The index
format itself, the commands that produce and fetch it, and the configuration
keys that place it are documented in
[its own repository](https://github.com/HeroicLands/package-build).

## Producing and fetching the index

|                 |                                                                                         |
| --------------- | --------------------------------------------------------------------------------------- |
| **Produced by** | `package-build content-index`, one JSON Lines file per package                          |
| **Written to**  | `build/content-index/<contentPackage>-metadata.jsonl` (`paths.contentIndex`)            |
| **Declared by** | a dependency under `relationships.systems` / `relationships.requires`                   |
| **Fetched by**  | a consumer's `package-build deps fetch`, into a local cache under `paths.metadataCache` |
| **Committed?**  | no — the published index and the fetched cache are both build output                    |

`deps fetch` reads the metadata URL the dependency's own release manifest
advertises, so a declared dependency needs nothing beyond that declaration. **A
compile never touches the network** — a build stays reproducible, and a cold
cache fails loudly at the package configuration rather than downloading
silently mid-build. A relationship declaring `contentIndex: false` is a Foundry
dependency only: nothing in it is addressable from the consumer, and `deps
fetch` fills no cache for it.

**This repository vendors nothing at all** — as the base package it declares
no dependency and fetches no index.

## How a cross-package link resolves

A build loads every fetched dependency's index as a **foreign index**, keyed by
the same canonical address a wikilink names. Resolving a local address first
consults the notes and assets this package itself defines; a target naming
another package by its fully qualified address additionally reaches into that
foreign index — a short form that omits the package segment never does, since
an omitted package means _this_ package by definition. Because keys are
globally unique, the foreign index merges directly into the local one: no
prefixing, no separate foreign-lookup path, no precedence rule to get wrong.

## Keys are canonical addresses

A key is `<package>-<system>-<type>-<shortcode>`, lowercased — the same address
an author writes in a wikilink, fully qualified. [[doc-contentlinks|Linking
Between Content Notes]] is the authority on the grammar: the short forms an
author may write, and what an omitted segment defaults to.

**Parsing is deterministic** because no package, system, type or shortcode
contains a hyphen (see [[doc-shortcodeintegrity|Shortcode Integrity]]), so a
key splits unambiguously into its segments.

## A document and its documentation are two entries

An item note compiles into an item **and**, separately, its prose compiles into
a JournalEntry. Two documents with two UUIDs, so two addresses:

```text
sohl-affliction-aconite      → the Item
sohl-docaffliction-aconite   → the JournalEntry holding its prose
```

A **macro** note is the same arrangement — `sohl-macro-autoattack` is the Macro,
`sohl-docmacro-autoattack` its write-up (see
[[doc-macronotes|Authoring a Macro Content Note]]). Which types work this way is
one set, `docEntryTypes()`, read by the compilers and by the content index
alike: held apart, they would drift into an index asserting documentation
nothing compiled.

The `doc<type>` form is the [[doc-contentlinks|virtual qualifier]] an author
already writes. The documentation entry names its subject by **address rather
than UUID** — the documentation entry owns that UUID, and stating it twice
would let the two disagree.

On the web both addresses resolve to the same page: the item note renders as
one page which _is_ its documentation.

## Anchors

Each note's index record names every section a link can address under
`anchors` — the `{#slug}` an author wrote, and `$lead`, reserved for a
journal's first page, which carries no authored slug of its own because every
journal has one. A consumer resolves a section link by looking the slug up in
the record that holds it rather than recomputing a page id.

## Which packages publish one

`sohl` and `thalorna` each publish a content index and are citable from the
other.

**`kethira` publishes none and is not a citable target.** It ships only Foundry
compendium packs, generates no web pages, and nothing in the other packages may
depend on it — it is licensed separately and must stay withdrawable without
affecting them. If it needs to cite another package it fetches that package's
index without publishing its own; the dependency must never run the other way.

That exclusion is a **licensing** decision, not a format one, and the two should
not be confused. A pack-only package — Foundry content with no site — can
publish a content index and be cited in Foundry by its Foundry addresses alone.
`kethira` still does not, because what makes it unciteable is that nothing may
depend on it, and an index edge pointing into it is exactly such a dependency.

## Unresolved addresses

Once every linkable package is either built locally or fetched, an address that
resolves nowhere can only be a typo, so an address failing to resolve fails the
build. A link that is not written as an address at all — unlabelled, or naming
no known type — is a separate finding, because the correction is a different
one: it has to _become_ an address, where a dead address has a shortcode to fix.

**Not failing the build is not the same as saying nothing.** An unresolved link
keeps the author's text, marked with the `sohl-unresolved-link` class so a
reader can tell a link was intended and an author can find it. Dropping the text
instead would silently rewrite the sentence; leaving it unmarked would make a
dead link indistinguishable from the prose around it, which is the failure this
whole mechanism exists to prevent. It is the one case where the reader is the
person best placed to notice.

Both surfaces mark it, in the same markup:

```html
<span class="sohl-unresolved-link" title="Unresolved link: being-nosuch">Name</span>
```

The appearance is not shared, because the two hosts theme differently. In
Foundry it comes from `scss/components/_unresolved-link.scss`, which uses
`light-dark()` — Foundry drives its themes through `color-scheme`. On the
knowledgebase it comes from the Hugo theme, which is single-mode dark and pins
the dark value; `light-dark()` there would resolve to the _light_ colour and
render the marker at roughly 2.5:1 against the page, which is a marker nobody
can see.

**A resolved address with no web page is not this case and is not marked.** A
pack-only package publishes Foundry addresses and no pages, so the
author wrote a real address and there is simply nothing to link to on the web.
Marking it would report correct content as a mistake.

## Links into a draft note {#links-into-a-draft-note}

A note tagged `draft` is a note that exists so a link into it is not dead, and
nothing else. It is **not** a resolution failure — the note compiles, validates,
publishes and resolves like any other, and it is in the packs, in the content
index and on the site — so it is marked separately, and for a different reason:
the target exists and is unwritten, where an unresolved link's target does not
exist at all.

Both surfaces mark it, in the same markup, with the link left live inside:

```html
<span class="sohl-draft-link" title="Draft — not yet written">@UUID[Compendium.…]{Text}</span>
```

The appearance follows the same split as above: `scss/components/_draft-link.scss`
in Foundry, the Hugo theme on the knowledgebase. It is deliberately unlike the
unresolved marking — normal weight, amber, a dashed underline rather than a bold
red dotted one — because a reader has to be able to tell the two apart.

This is not the `draft:` frontmatter field, which is refused by name. The tag
changes nothing but how a citing link looks: the note stays published, and the
build failures it carries are still reported.
