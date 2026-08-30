---
"sohl": patch
---

**Compiled gear items no longer carry `isEquipped`.**
`@heroiclands/package-build` moves from 5.0.0 to 6.0.0 (#1767).

The pack builder emitted `system.isEquipped: false` on every gear item
(HeroicLands/package-build#68), and no SoHL data model has declared that field
since #662 made worn/equipped armour-only and gave `ArmorGearDataModel` its own
`isWorn` — shipped in **0.8.0**. Foundry discards an undeclared key when the
document is constructed, so no released version has ever read it. The compiled
documents change; nothing observable does.

**What moved, measured key-ordered across the bump.** Exactly **1,019 keys
removed from 1,012 of the 3,126 compiled documents** — 1,010 items (465
`miscgear`, 331 `armorgear`, 114 `containergear`, 82 `weapongear`, 18
`projectilegear`) plus 9 more embedded in two gear-carrying actors. Every
removed value was `false`; no key was added, no value changed, no document was
added or removed, and the order of every surviving key is unchanged in every
document. A consumer diffing packs after upgrading sees that removal and nothing
else. The field was never authorable — the declaration carried no `name`, so no
note could set it — so there is no line to delete anywhere in the content tree.

**The pack list's order stops being load-bearing**
(HeroicLands/package-build#73). The dependency is still real — the actors pass
resolves each being's embedded items against the items pass's _output_ — but the
build now derives the schedule from what each pass declares it reads instead of
trusting the declared order. This repository's list already compiles in the
order it is written, so nothing moves; the comments in
`package-build.config.yaml` and in the content-creator and build docs that said
the order decides it are corrected, along with the superseded single-pack error
message they quoted.

**Two new checks, both clean here.** `packageBuild.manifest.packFolders` is now
compared against the packs the package actually ships, and a folder naming a
pack that does not exist is an error that stops the manifest write
(HeroicLands/package-build#81) — the one declared manifest key that names a
derived value. All six packs are named by the one folder, the companion
`adventures` pack included, so the generated `system.json` is byte-identical.
The package homepage's own links are now checked too
(HeroicLands/package-build#54), and `assets/content/homepage.md` resolves clean.

**One licence is reversed, and it does not bite here**
(HeroicLands/package-build#75). The `sohlKb` TypeDoc symbol map now resolves
against the repository root and a configured-but-unreadable map fails the build,
where it used to be swallowed and every `{@link}` published as a code span at
exit 0. This repository commits `kb/data/api-symbols.json`, so the pass reports
`resolved 5411 API symbols` and the generated knowledgebase is byte-identical —
1,606 content pages, 46 tree pages, 17 landings and the homepage, with all 299
`/sohl/api/` anchors exactly as before. The link manifest is unchanged at 2,989
entries from 1,606 addressable notes.
