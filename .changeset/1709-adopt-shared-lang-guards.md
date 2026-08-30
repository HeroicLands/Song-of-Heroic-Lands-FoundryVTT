---
"sohl": patch
---

**The two localization guards move to `@heroiclands/package-build`.**
`utils/check-lang-coverage.mjs` (596 lines) and `utils/check-lang-hardcoded.mjs`
(165 lines) were this repository's copies of rules every HeroicLands package
needs. They are deleted; `lint:lang-coverage` and `lint:lang-hardcoded` now run
`package-build lang coverage` and `package-build lang hardcoded`, so all three
localization checks come from one place and both satellites — which ship `lang/`
files and had no guard at all — can run the same ones.

**What stays this repository's.** `defineType(prefix, def, labelKeys?)`
(`src/utils/constants.ts`) mints one localization key per member of an enum by a
rule of its own, and decides whether those labels are _required_ by whether the
bundle's `labels`/`choices` is consumed. No shared guard can know that, so it is
contributed through `utils/lang-references.mjs`, named in
`packageBuild.lang.references` and covered by
`tests/build/lang-references.test.ts`. The `RETAINED` and `ALLOWED` lists move
into `packageBuild.lang.retained` and `packageBuild.lang.allow`, each entry
keeping the prose reason it carried.

**The verdict is unchanged, and was measured rather than assumed.** Both guards
were run over `lang/en.json` before and after: 1,791 keys declared, 0 missing, 0
unreferenced, 103 templates localized and compiling. Run without the contributor
the shared coverage rule reports 34 missing keys — every one a `defineType`
prefix — which is the measure of how much of the deleted script was genuinely
SoHL's; with `retained` emptied it reports 33 unreferenced, exactly the set that
list covers. The generated-key sets match exactly (163 keys, identical), all 24
`LOCALIZATION_PREFIXES` entries are read by the shared scan, and no key the old
guard vouched for is dropped: the 33 references it recorded and the shared one
does not are all namespace heads, none of them a declared key.

**Two things the shared rules do better.** `(concat "SOHL.X." value)` — a
literal ending on a dot — is read as the key shape `SOHL.X.*`, which the local
guard recognised only in the template-literal spelling; the
`SOHL.ContextMenu.SortGroup.` retained entry existed solely to silence those
four false positives and is therefore **not** carried over. And an attribute
literal is reported once rather than twice, since `data-title="…"` no longer
also matches as `title="…"`.

**One deliberate behaviour change.** An unreferenced key is now a **warning**,
not a build failure — no scan sees every way a key is reached, and a guard that
fails a build over one teaches everybody to switch it off. Missing keys still
fail. The advisory half prints the first twenty and states the total;
`npx package-build lang coverage --unused` lists them all.

`--absent` (which listed the `defineType` bundles whose labels are a byproduct)
has no shared equivalent and is gone; it reported nothing that affected a
verdict.

(Closes #1709.)
