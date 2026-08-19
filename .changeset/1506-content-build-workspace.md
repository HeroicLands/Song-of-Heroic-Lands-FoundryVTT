---
"sohl": patch
---

Add npm workspaces and scaffold `@heroiclands/content-build` (#1506).

`packages/sohl-types` was published by hand from a sibling directory: the root
`package.json` had no `workspaces` key, so the package was never linked into the
repository that produces it. #407 planned workspaces and that half was never
implemented. Adding a second package is the moment to fix it — with workspaces
this repository consumes its own toolchain **by path**, so a compiler change is
usable here without a release, and only external repositories wait on a version.

**The new package.** `packages/content-build` is `@heroiclands/content-build`,
the shared toolchain that will compile a HeroicLands content tree into Foundry
compendium packs. It ships the internal split the epic mandates — `engine/` for
the package-agnostic machinery (walk, frontmatter, tables, wikilinks, ids,
folders, link manifest, `BasePackCompiler`, the generic document compilers) and
`sohl/` for the SoHL data-model knowledge (`ITEM_TYPES`, `BUILDERS`, the items
and actors compilers, default art), so that an adventure module never receives
`buildWeaponGear`. **No compiler code moves yet**: both barrels are real and
empty, and the `content-build` command implements only `--help` and
`--version`, refusing anything else rather than pretending to have built
something.

**The configuration contract.** `defineConfig` is the whole of the per-repository
configuration: the content package, the Foundry package, the package kind
(`systems` or `modules`), the pack list, the asset list, and three independent
publishing switches — `site`, `manifests.publish`, `manifests.consume`. It
validates, defaults, and deeply freezes a copy, throwing a `TypeError` that names
the offending field, so a malformed config fails at load rather than as an empty
pack much later. The three switches are independent because every combination is
real: `kethira` publishes neither a site nor a manifest yet still consumes them.

**The trailing `"."` in `workspaces` is deliberate.** npm does not need it, but
Changesets discovers packages through the same globs and excludes the root
package in workspace mode — without it, every pending changeset fails with
_"Found changeset … for package sohl which is not in the workspace"_ and the
release workflow stops before it releases anything. Listing the root keeps `sohl`
a package Changesets can version.

**Release path.** `release.yml` gains a publish step alongside the existing
`@heroiclands/sohl-types` one, using npm Trusted Publishing (OIDC, no
`NPM_TOKEN`), idempotent against an already-published version and
`continue-on-error` for the same reason as its sibling. The package's `prepack`
regenerates its `.d.mts` declarations from its own JSDoc.
