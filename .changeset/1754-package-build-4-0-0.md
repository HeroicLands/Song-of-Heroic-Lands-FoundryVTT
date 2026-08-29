---
"sohl": patch
---

**The retired `package:` and `draft:` frontmatter fields are now build errors.**
`@heroiclands/package-build` moves from 3.4.0 to 4.0.0 (#1754).

The major carries two retirements, both of capabilities this repository had
already stopped using. A note declaring `package:` is now rejected outright
(HeroicLands/package-build#56) — the field was stripped from every note in #1745,
because a note's package is the repository's configured `contentPackage` and the
derivation rule owns it. The `draft:` capability is removed entirely and the field
rejected (HeroicLands/package-build#69); it used to drop a note from the compiled
packs, the link manifest and the site with nothing reporting the exclusion, so
every wikilink into a drafted note read as a link to a note that does not exist —
and, as #1745 found, any pack-compile error inside one was hidden too. A note that
is unfinished is tagged `#draft` instead, which the build ignores and a
`FROM #draft` query still finds.

**Nothing this repository emits changes.** All 1,606 notes were already swept of
both fields, so 4.0.0 only closes the door behind them. `build/packs-json` is
byte-identical across the bump — all 3,126 files, with document counts unchanged
(1,379 items, 1,511 journals, 95 actors, 1 macro, 3 scenes, 1 adventure) — as are
the link manifest (2,989 entries) and the generated knowledgebase (1,606 content
pages + 46 tree pages + 17 landings, unchanged as a page set and byte-for-byte).
No generated-and-committed file moves, so this is a lockfile-and-manifest change
only.

What the bump buys is that the sweep can no longer regress silently: reintroducing
either field now fails both `content-build lint` and the pack compile with a
located, compiler-parseable error naming the file, line and column.
