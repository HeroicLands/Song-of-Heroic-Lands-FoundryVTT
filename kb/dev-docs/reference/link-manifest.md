# The Link Manifest

See also: [Linking Between Content Notes](../content-creator/content-links.md), [Shortcode Integrity](./shortcode-integrity.md), [Build, Deployment, and Release](../how-to/build-and-deployment.md)

Each content package is single-sourced in the repository that ships it, so a note
in one package citing a note in another has no shared index to resolve against.
The **link manifest** is that index: one file per package, naming every note it
publishes and giving every address needed to link to it — on the web and in
Foundry.

This page is the **contract**. It is what another repository codes against, so
treat every rule below as load-bearing rather than descriptive.

## Where it lives

|                  |                                                                       |
| ---------------- | --------------------------------------------------------------------- |
| **Emitted to**   | `build/manifests/<package>.json`, by `npm run build:link-manifest`    |
| **Emitted by**   | `content-build manifest`, from configuration — no script in this repo |
| **Published by** | copying that file into the consuming repository's `assets/manifests/` |
| **Committed?**   | yes, in the consumer                                                  |

The vendored copy is committed deliberately. A contributor without every
repository checked out then resolves exactly the links CI does, and a build never
depends on a sibling checkout being present or current.

## How an entry's `path` is derived

Every `path` in this file is produced by the same address rule the knowledgebase
build emits its pages at, from one setting in `content-build.config.yaml`:

```yaml
publish:
  address:
    prefix: kb/ # this package's content mounts under `kb/`
    landing: readme # a `README.md` addresses its section
```

That the two read one setting is the point. A manifest is a set of promises
about where pages are, so a manifest deriving addresses independently of the
build that publishes them will eventually promise one that resolves at build
time and 404s for a reader — which is the failure the whole format exists to
prevent.

`prefix` is where the content tree mounts **inside this package**, never where
the package itself is served: that is the consuming build's knowledge, applied
when it resolves an entry (see [What a consumer must do](#what-a-consumer-must-do)).
`sohl` publishes a knowledgebase alongside generated API docs, so its notes sit
under `kb/`; a package whose site is nothing but its content has no prefix.

A note the rule yields no address for — a `doc` with no `category` — is reported
as a located diagnostic and left out of the manifest. It is never given a guessed
address, because an entry pointing at a page that does not exist is worse than no
entry at all.

## Format

```jsonc
{
  "version": 5,
  "package": "sohl", // the CONTENT package these notes declare
  "foundryPackage": "sohl", // the FOUNDRY package shipping the documents
  "entries": {
    "sohl-affliction-aconite": {
      "path": "kb/affliction/aconite/",
      "name": "Aconite",
      "uuid": "Compendium.sohl.items.Item.J6aklskzkfBdEnoo",
      "doc": "sohl-docaffliction-aconite",
    },
    "sohl-docaffliction-aconite": {
      "path": "kb/affliction/aconite/",
      "name": "Aconite",
      "uuid": "Compendium.sohl.journals.JournalEntry.e0e3f50b1f1ebcf8",
      "anchors": {
        "$lead": "Compendium.sohl.journals.JournalEntry.e0e3f50b1f1ebcf8.JournalEntryPage.2d448b72c005a250",
      },
    },
  },
}
```

### Document fields

| Field            | Meaning                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `version`        | Format version. See [Versioning](#versioning).                                                                           |
| `package`        | The **content** package — what a note declares as `package:` in frontmatter.                                             |
| `foundryPackage` | The **Foundry** package whose compendiums hold the compiled documents. Absent when the emitting build compiles no packs. |
| `entries`        | Canonical address → entry. Sorted, so a committed copy diffs only on real change.                                        |

`package` and `foundryPackage` are **different namespaces** and coincide only by
accident. A note says `package: thalorna`; its documents are addressed
`Compendium.sohl-thalorna.…`. Only the content package is invariant across
compilation targets, which is why addresses are namespaced on it.

### Entry fields

| Field     | Required | Meaning                                                                |
| --------- | -------- | ---------------------------------------------------------------------- |
| `name`    | yes      | The document's display name, used as a link's fallback label.          |
| `path`    | no       | The note's address **below the package's own base**, no leading slash. |
| `uuid`    | no       | The Foundry UUID of the document this note compiles into.              |
| `doc`     | no       | For an item, the **address** of its documentation entry.               |
| `anchors` | no       | Named sections → the whole UUID each compiled to.                      |

`name` is the only required field, because it is the only one that is not an
address. A note may have a web address, a Foundry address, or both, and the
entry states the ones it has.

## A package need not publish pages

`path` and `uuid` are optional **independently** (#1516). Two publishing
profiles follow from that, and the format has to carry both:

| Publishes                                      | `path` | `uuid` |
| ---------------------------------------------- | ------ | ------ |
| Pages and packs                                | yes    | yes    |
| Pages only — a note compiling into no document | yes    | no     |
| Packs only — a module with no site             | no     | yes    |

The pack-only case is the mirror of the one the format already handled, and it
is real: a module can ship compendiums and no website while its documents stay
perfectly citable, because a Foundry `@UUID` link resolves inside Foundry and
owes the web nothing. Requiring `path` would have made "publishes a manifest"
mean "publishes a website", so such a module could not be cited from anywhere —
not for any property of its documents, but because the index had no way to
describe it.

**Whether a package publishes pages is a package-level fact, not a per-note
one.** The emitter states it once, by whether it passes a base to
`buildManifest`; with none, no entry carries a `path`. That is deliberate: if
`path` could go missing per note, a web-publishing package could half-emit, and
the notes that quietly lost theirs would degrade to unlinked prose in every
consumer with nothing erroring anywhere. A **consumer** must still tolerate a
mixed file rather than reject it — the guarantee is on the emitting side, and a
consumer that hard-failed on the mix would freeze a rule that a future profile
may need relaxed.

**A pack-only package needs no `PACKAGE_BASE` entry.** A base exists to resolve
a `path`; with no paths there is nothing to resolve. A base _is_ still demanded
the moment any entry carries a `path`, since silently dropping such a package
would turn every link into it back into an address that reads as a typo.

## Keys are canonical addresses

A key is `<package>-<type>-<shortcode>`, lowercased — the same string an author
writes in a wikilink, fully qualified.

The address is a namespace: a `shortcode` is scoped by its `type`, and a `type`
is scoped by the **package** defining it. Both `sohl` and `thalorna` publish
`doc` notes, so only the package segment makes `doc-readme` unambiguous.

**Parsing is deterministic** because no package, type or shortcode contains a
hyphen — types are bare words and shortcodes are `^[A-Za-z0-9]+$` (see
[Shortcode Integrity](./shortcode-integrity.md)). Split on `-` into exactly three
parts; anything else is not a canonical key.

Because keys are globally unique, a vendored manifest **merges directly into a
consumer's own index** — no prefixing, no separate foreign-lookup path, no
precedence rule. That is the property the format exists to provide, and a key
already present on merge is therefore a real conflict rather than an artefact of
two packages sharing a namespace.

### Readable is not addressable

A consumer must check that the keys it merged are keys it can actually _use_,
because the failure mode when they are not is silent. An address that resolves
to nothing falls through to its own display text, so the page still reads
correctly and the link is simply gone — a dead-link check never sees it, having
only ever been shown addresses that resolved somewhere wrong. That is exactly
what happened when keys became canonical (#1499): this repository read 2,367
`thalorna` entries through a lookup keyed the way v2 wrote them, and not one
cross-package link worked for over a release (#1664).

So both consumers here — `build-kb-content` and `check-content-links` — call
`assertForeignManifestsAddressable` (`utils/kb-foreign-manifest.mjs`) right after
loading, and **fail** when a package contributes entries of which none yields a
readable canonical key. The diagnostic locates the offending key inside the
manifest, so it names the file at fault rather than the notes that cite it.

Two cases deliberately do **not** fail. A package contributing no entries is
normal — a pack-only package publishes no addressable pages (#1516) and one
being brought up publishes nothing yet. And _partial_ drift resolves something,
so whatever it fails to resolve surfaces as an ordinary dead address, reported
against the citing note where a reader can act on it.

## A document and its documentation are two entries

An item note compiles into an item **and**, separately, its prose compiles into a
JournalEntry. Two documents with two UUIDs, so two addresses:

```text
sohl-affliction-aconite      → the Item
sohl-docaffliction-aconite   → the JournalEntry holding its prose
```

A **macro** note is the same arrangement — `sohl-macro-autoattack` is the Macro,
`sohl-docmacro-autoattack` its write-up (see
[Authoring a Macro Content Note](../content-creator/macro-notes.md)). Which types work this way is
one set, `docEntryTypes()`, read by the compilers and by this emitter alike:
held apart, they drift into a manifest asserting documentation nothing compiled.

The `doc<type>` form is the [virtual qualifier](../content-creator/content-links.md) an author
already writes. The document's own entry names it with `doc`, as an **address
rather than a UUID** — the documentation entry owns that UUID, and stating it
twice would let the two disagree.

On the web both addresses resolve to the same `path`: the item note renders as
one page which _is_ its documentation.

## Anchors

`anchors` maps a note's named sections to the **complete** UUID each one compiled
to, never a fragment to be appended to `uuid`.

```jsonc
"anchors": {
  "$lead":      "Compendium.sohl.journals.JournalEntry.<id>.JournalEntryPage.<pageId>",
  "shock-test": "Compendium.sohl.journals.JournalEntry.<id>.JournalEntryPage.<pageId>"
}
```

- **`$lead` is reserved** for the entry's first page. Every journal has one and it
  is what an item's `system.docHtml` points at, but it carries no authored
  `{#slug}` — so without a reserved name the one page guaranteed to exist would be
  the one page the manifest could not address. It cannot collide with an authored
  slug, which is `[a-z0-9-]+`.
- **Every other key is an authored `{#slug}`** from a heading in the note.
- **The key is omitted entirely** when a note has no anchors.

Whole UUIDs rather than fragments, for two reasons. An anchor is not _required_
to live inside its own entry — today it always does, but that is a property of
the current derivation, not something worth freezing into a published format. And
it keeps the page-id derivation out of the contract: a consumer resolves a
section link with a lookup instead of reimplementing a hash whose exact
algorithm, encoding and truncation it would have to match, in whatever language
it is written in.

## What a consumer must do

1. **Check `version` against the set you can read, and refuse anything else.**
   Do not attempt to read a shape whose values mean something different. See
   [Versioning](#versioning).
2. **Tolerate an entry with no `uuid`.** A note that publishes a page but
   compiles into no Foundry document has none, and inventing one would assert a
   target that does not exist. This is normal, not an error.
3. **Tolerate an entry with no `path`, and degrade instead of guessing.** A
   pack-only package publishes no pages, so a web build that wants an `href`
   has none to emit. Render the author's text — the entry's `name` for an
   unlabelled address — with no link, and **do not fail the build**: the
   address resolved, so this is not a typo, and it is not the author's error
   that the target has no web presence. Never derive a URL from the key, and
   never emit `[Name](undefined)`, which renders as a link and goes nowhere —
   exactly the silent dead link this format exists to prevent. A pack build is
   unaffected: it resolves through `uuid` and never reads `path`.
4. **Tolerate an entry with no `anchors` and no `doc`.** Both are optional.
5. **Resolve `path` against your own base for that package.** A manifest records
   where a note sits _within_ its package and says nothing about where the
   package is mounted — so the consumer prefixes its own base. Never store or
   assume the emitter's mount point.
6. **Resolve a bare address only when exactly one package publishes it.** An
   address with no package segment names no package; if two publish it, it is
   ambiguous and the author must qualify it. Picking one would make the build
   depend on which manifest happened to load first.
7. **Do not treat `doc<type>` as a real type.** It is a virtual qualifier formed
   by prefix. Admitting it to a known-type set makes it real, and a real type owns
   its own name — which stops the virtual reading from firing and breaks every
   `[[docskill-wpnc]]`. Read such an address as its underlying type plus an
   item-doc flag, then look the manifest up under `doc<type>`.

## Versioning

`version` catches a stale **format**, and nothing else.

| Version | Change                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1       | Initial: entries keyed `type/shortcode`, valued `{ url, name }`.                                                        |
| 2       | Site-absolute `url` became package-relative `path` (#1465).                                                             |
| 3       | Keys became fully qualified; entries gained Foundry addresses (#1499).                                                  |
| 4       | Keys took the authored hyphen separator; item docs became entries in their own right; entries gained `anchors` (#1499). |
| 5       | `path` became optional, so a pack-only package can publish Foundry addresses (#1516).                                   |

A version is what stops a file whose values _read differently_ from being
resolved anyway — a v2 key read as a v4 one addresses a package named after a
type, and a v1 `url` prefixed with a base yields `/thalorna/thalorna/…`, which
resolves, renders, and 404s for the reader. That is the only thing it gates.

**A consumer therefore declares the set of versions it can read, not one
version.** Versions 1–4 each changed a reading, so each dropped its
predecessors. **v5 did not:** it only permits an absent `path`, so every v4
value still means exactly what it meant, and a v4 file is read as-is. Refusing
it would make a purely relaxing change a flag day — every package re-emitting on
the same afternoon or every build breaking — which is a large recurring cost for
no safety, and precisely the cost that made this decision urgent (#1516).

The unsafe direction is unchanged and still **fails the build**: a consumer
meeting a version _above_ its set rejects the file, because it cannot know what
the newer shape permits. So widening the format is always safe to publish first
and adopt elsewhere later, and a stale consumer never silently misreads.

**It cannot detect stale content.** A note added in another package is simply
unlinkable here until the manifest is re-vendored. Re-vendor after that package
changes its content, not only when the format moves.

## Which packages publish one

`sohl` and `thalorna` each publish a manifest and are citable from the other.

**`kethira` publishes none and is not a citable target.** It ships only Foundry
compendium packs, generates no web pages, and nothing in the other packages may
depend on it — it is licensed separately and must stay withdrawable without
affecting them. If it needs to cite another package it consumes manifests without
publishing one; the dependency must never run the other way.

That exclusion is a **licensing** decision, not a format one, and the two should
not be confused. Since #1516 a pack-only package _can_ publish a manifest, so
another module in the same shape — packs only, no site — may publish one and be
cited in Foundry. `kethira` still does not, because what makes it unciteable is
that nothing may depend on it, and a manifest edge pointing into it is exactly
such a dependency.

## Unresolved addresses

Once every linkable package is either built locally or vendored, an address that
resolves nowhere can only be a typo, so a **qualified** address failing to
resolve fails the build. A **bare** alias does not — it may be ordinary prose
that merely looks like a link.

**Not failing the build is not the same as saying nothing.** An unresolved link
keeps the author's text, marked with the `sohl-unresolved-link` class so a
reader can tell a link was intended and an author can find it. Dropping the text
instead would silently rewrite the sentence; leaving it unmarked would make a
dead link indistinguishable from the prose around it, which is the failure this
whole index exists to prevent. It is the one case where the reader is the person
best placed to notice.

Both surfaces mark it, in the same markup:

```html
<span class="sohl-unresolved-link" title="Unresolved link: being-nosuch"
  >Name</span
>
```

The appearance is not shared, because the two hosts theme differently. In
Foundry it comes from `scss/components/_unresolved-link.scss`, which uses
`light-dark()` — Foundry drives its themes through `color-scheme`. On the
knowledgebase it comes from the Hugo theme, which is single-mode dark and pins
the dark value; `light-dark()` there would resolve to the _light_ colour and
render the marker at roughly 2.5:1 against the page, which is a marker nobody
can see.

**A resolved address with no `path` is not this case and is not marked.** A
pack-only package (#1516) publishes Foundry addresses and no pages, so the
author wrote a real address and there is simply nothing to link to — see
consumer rule 3 above. Marking it would report correct content as a mistake.
