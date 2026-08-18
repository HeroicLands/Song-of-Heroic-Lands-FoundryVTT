---
"sohl": patch
---

Publish Foundry UUIDs in the link manifest, and address every note canonically (#1499).

The manifest from #1446 carried each note's web address only, so a build compiling
packs had no way to resolve a link into another package — and no way to notice a
shortcode another package already claimed.

**Manifest version 3.** Keys are now **canonical**: fully qualified
`package/type/shortcode` rather than `type/shortcode`, and entries carry the
Foundry `uuid` / `docUuid` beside the web `path`, with `foundryPackage` in the
header. A canonical key is globally unique, which is what lets a vendored
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
