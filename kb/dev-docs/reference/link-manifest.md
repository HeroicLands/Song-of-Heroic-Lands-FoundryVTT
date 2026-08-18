# The Link Manifest

See also: [Linking Between Content Notes](./content-links.md), [Shortcode Integrity](./shortcode-integrity.md), [Build, Deployment, and Release](../how-to/build-and-deployment.md)

Each content package is single-sourced in the repository that ships it, so a note
in one package citing a note in another has no shared index to resolve against.
The **link manifest** is that index: one file per package, naming every note it
publishes and giving every address needed to link to it — on the web and in
Foundry.

This page is the **contract**. It is what another repository codes against, so
treat every rule below as load-bearing rather than descriptive.

## Where it lives

| | |
| --- | --- |
| **Emitted to** | `build/manifests/<package>.json`, by `npm run build:link-manifest` |
| **Published by** | copying that file into the consuming repository's `assets/manifests/` |
| **Committed?** | yes, in the consumer |

The vendored copy is committed deliberately. A contributor without every
repository checked out then resolves exactly the links CI does, and a build never
depends on a sibling checkout being present or current.

## Format

```jsonc
{
  "version": 4,
  "package": "sohl",           // the CONTENT package these notes declare
  "foundryPackage": "sohl",    // the FOUNDRY package shipping the documents
  "entries": {
    "sohl-affliction-aconite": {
      "path": "kb/affliction/aconite/",
      "name": "Aconite",
      "uuid": "Compendium.sohl.items.Item.J6aklskzkfBdEnoo",
      "doc":  "sohl-docaffliction-aconite"
    },
    "sohl-docaffliction-aconite": {
      "path": "kb/affliction/aconite/",
      "name": "Aconite",
      "uuid": "Compendium.sohl.journals.JournalEntry.e0e3f50b1f1ebcf8",
      "anchors": {
        "$lead": "Compendium.sohl.journals.JournalEntry.e0e3f50b1f1ebcf8.JournalEntryPage.2d448b72c005a250"
      }
    }
  }
}
```

### Document fields

| Field | Meaning |
| --- | --- |
| `version` | Format version. See [Versioning](#versioning). |
| `package` | The **content** package — what a note declares as `package:` in frontmatter. |
| `foundryPackage` | The **Foundry** package whose compendiums hold the compiled documents. Absent when the emitting build compiles no packs. |
| `entries` | Canonical address → entry. Sorted, so a committed copy diffs only on real change. |

`package` and `foundryPackage` are **different namespaces** and coincide only by
accident. A note says `package: thalorna`; its documents are addressed
`Compendium.sohl-thalorna.…`. Only the content package is invariant across
compilation targets, which is why addresses are namespaced on it.

### Entry fields

| Field | Required | Meaning |
| --- | --- | --- |
| `path` | yes | The note's address **below the package's own base**, no leading slash. |
| `name` | yes | The document's display name, used as a link's fallback label. |
| `uuid` | no | The Foundry UUID of the document this note compiles into. |
| `doc` | no | For an item, the **address** of its documentation entry. |
| `anchors` | no | Named sections → the whole UUID each compiled to. |

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

## An item and its documentation are two entries

An item note compiles into an item **and**, separately, its prose compiles into a
JournalEntry. Two documents with two UUIDs, so two addresses:

```text
sohl-affliction-aconite      → the Item
sohl-docaffliction-aconite   → the JournalEntry holding its prose
```

The `doc<type>` form is the [virtual qualifier](./content-links.md) an author
already writes. The item's entry names it with `doc`, as an **address rather than
a UUID** — the documentation entry owns that UUID, and stating it twice would let
the two disagree.

On the web both addresses resolve to the same `path`: the item note renders as
one page which *is* its documentation.

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

Whole UUIDs rather than fragments, for two reasons. An anchor is not *required*
to live inside its own entry — today it always does, but that is a property of
the current derivation, not something worth freezing into a published format. And
it keeps the page-id derivation out of the contract: a consumer resolves a
section link with a lookup instead of reimplementing a hash whose exact
algorithm, encoding and truncation it would have to match, in whatever language
it is written in.

## What a consumer must do

1. **Check `version` and refuse a mismatch.** Do not attempt to read an older
   shape. See [Versioning](#versioning).
2. **Tolerate an entry with no `uuid`.** A note that publishes a page but
   compiles into no Foundry document has none, and inventing one would assert a
   target that does not exist. This is normal, not an error.
3. **Tolerate an entry with no `anchors` and no `doc`.** Both are optional.
4. **Resolve `path` against your own base for that package.** A manifest records
   where a note sits *within* its package and says nothing about where the
   package is mounted — so the consumer prefixes its own base. Never store or
   assume the emitter's mount point.
5. **Resolve a bare address only when exactly one package publishes it.** An
   address with no package segment names no package; if two publish it, it is
   ambiguous and the author must qualify it. Picking one would make the build
   depend on which manifest happened to load first.
6. **Do not treat `doc<type>` as a real type.** It is a virtual qualifier formed
   by prefix. Admitting it to a known-type set makes it real, and a real type owns
   its own name — which stops the virtual reading from firing and breaks every
   `[[docskill-wpnc]]`. Read such an address as its underlying type plus an
   item-doc flag, then look the manifest up under `doc<type>`.

## Versioning

`version` catches a stale **format**, and nothing else.

| Version | Change |
| --- | --- |
| 1 | Initial: entries keyed `type/shortcode`, valued `{ url, name }`. |
| 2 | Site-absolute `url` became package-relative `path` (#1465). |
| 3 | Keys became fully qualified; entries gained Foundry addresses (#1499). |
| 4 | Keys took the authored hyphen separator; item docs became entries in their own right; entries gained `anchors` (#1499). |

Each bump changes how a key or value *reads*, not merely what it contains — a v2
key read as a v4 one addresses a package named after a type, and a v1 `url`
prefixed with a base yields `/thalorna/thalorna/…`, which resolves, renders, and
404s for the reader. A version mismatch therefore **fails the build** rather than
being resolved anyway.

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

## Unresolved addresses

Once every linkable package is either built locally or vendored, an address that
resolves nowhere can only be a typo, so a **qualified** address failing to
resolve fails the build. A **bare** alias remains a warning — it may be ordinary
prose that merely looks like a link.

An unresolved link keeps the author's text, marked with the
`sohl-unresolved-link` class so a reader can tell a link was intended. Dropping
the text instead would silently rewrite the sentence.
