---
"sohl": patch
---

**No content note declares `package:` any more.** All 1,606 notes under
`assets/content/` and the 33 knowledgebase notes under `kb/dev-docs/` carried
`package: sohl` — the same value every time, because this repository authors
exactly one package's content. A note's package is now derived from the
`contentPackage` this repository configures in `package-build.config.yaml`, so
restating it per note is redundant (#1745).

**The dependency bump ships with the sweep rather than after it.** On
`@heroiclands/package-build` 3.2.0 and earlier the field was a _selector_ —
`engine/base-compiler.mjs` skipped any note whose `fm.package` did not equal the
configured package, and an absent value never matches — so stripping it would
have filtered out every note in the tree and still exited 0. 3.3.0 (step 1 of
HeroicLands/package-build#56) derives the package instead, and reports a note
that names a _different_ one as a named error rather than a silent skip. The
sweep is correct only on `^3.3.0`.

The compiled packs are unchanged: `build/packs-json` is byte-identical stripped
against restored on 3.3.0, all 3,126 documents.

**Documentation.** `content-creator/item-frontmatter.md` is regenerated (the
generator stopped emitting `package:` in 3.3.0), and the pages that taught the
field in prose now say the package is the repository's configured
`contentPackage` rather than something a note declares —
`content-creator/authoring-workflow.md`, `README.md`, `actor-notes.md`,
`macro-notes.md`, `map-notes.md`, `asset-conventions.md`,
`how-to/build-and-deployment.md`, and `reference/link-manifest.md`.
