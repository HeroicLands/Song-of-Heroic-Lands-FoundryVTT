---
"sohl": patch
---

Publish Foundry UUIDs in the link manifest, and address every note canonically (#1499).

The manifest from #1446 carried each note's web address only, so a build compiling
packs had no way to resolve a link into another package — and no way to notice a
shortcode another package already claimed.

**Manifest version 4.** Keys are now **canonical**: fully qualified and spelled
with the authored hyphen separator, so a key _is_ the address an author writes —
`sohl-affliction-aconite`. Entries carry the Foundry `uuid` beside the web
`path`, with `foundryPackage` in the header.

**An item and its documentation are two entries.** They are two documents with
two UUIDs, so they get two addresses — `sohl-affliction-aconite` and
`sohl-docaffliction-aconite` — each stating its own `uuid`. The item entry
carries a `doc` pointer naming the other address rather than repeating its UUID,
because the doc entry owns that fact.

**Entries carry `anchors`**, mapping a note's named sections to the **whole**
UUID each compiled to, with the first page under the reserved name `$lead` — the
one page every journal has, and what an item's `docHtml` points at. Whole UUIDs
rather than fragments appended to `uuid`: nothing owns a page address, so a
complete link restates nothing, an anchor is free to live outside its own entry,
and the page-id hash (sha256 → base64 → strip → truncate) stays out of the
published contract entirely. A consumer resolves a section link with a lookup
instead of reimplementing it.

**The manifest is emitted beside the pack compilers**, not from the knowledgebase
build, because only the build that splits notes into pages knows their anchors.
The web address moves to a shared `content-address.mjs` that both builds import,
so the two cannot drift. A canonical key is globally unique, which is what lets a vendored
manifest merge straight into a local index — one map, one lookup, no precedence
rule — and makes a key already present a real conflict rather than an artefact of
two packages sharing a namespace. The version bump is load-bearing: a v2 key read
as a v3 one addresses a package named after a type.

**The package segment is optional in authored links.** `[[skill-lang]]` still
means the citing note's own package; `[[sohl-skill-lang]]` names one explicitly,
for the case where two packages claim an address. It parses unambiguously because
no type and no shortcode contains a hyphen, and it is read only when the segment
names a known package _and_ the remainder is itself a valid address — so a note
called "Grukar-ahk" stays an alias.

**`utils/packs/` is parameterised, restoring its diff with `sohl-thalorna`.**
`ids.mjs` gains `compendiumUuid()` / `pageUuid()` and owns the type → pack
mapping, which now holds pack names rather than whole addresses;
`buildWikilinkIndex` computes each note's UUID once and `convertWikilinks` looks
it up. `content-package.mjs` names `CONTENT_PACKAGE` and `FOUNDRY_PACKAGE_ID`
separately — they are equal here only by coincidence, and conflating them is what
made every `sohl-thalorna` link address this system (#1498). Emitted pack output
is byte-identical, verified by hash against the previous build.

**The pack build resolves cross-package links too.** It vendors the other
package's manifest, merges its canonically keyed entries into the wikilink index
— one map, one lookup, no precedence rule — and resolves a foreign address to
the UUID the manifest states, anchors included. 43 links now address
`Compendium.sohl-thalorna.*`.

With every linkable package either built here or vendored, a _qualified_ address
that resolves nowhere can only be a typo, so it now fails the note rather than
degrading silently. A bare alias stays a warning: it may be ordinary prose.

**An unresolved link keeps its text and is marked.** It renders as
`<span class="sohl-unresolved-link">`, styled in
`scss/components/_unresolved-link.scss` — bold, dotted underline, and a colour
chosen per theme with `light-dark()`, since Foundry drives its themes through
`color-scheme`. Both values are contrast-checked rather than eyeballed:
`#B3261E` reaches 5.5–6.5:1 on light backgrounds, `#FF8A80` 6.8–8.3:1 on dark.
The text is escaped, so content cannot inject markup.

**The contract is documented.** `kb/dev-docs/reference/link-manifest.md` is the
page another repository codes against: the format field by field, how canonical
keys parse, why an item and its documentation are two entries, what `$lead` is,
and the six rules a consuming build must follow — including that an entry
legitimately has no `uuid`, that `path` is resolved against the consumer's own
base, and that `doc<type>` must never be admitted as a real type.
