# Vendored link manifests

One `<package>.json` per package this repository links **into** but does not
publish — the cross-package link manifest described in #1446.

Each file is produced by that package's own build (`build/manifests/`) and copied
here. It maps a note's canonical address to every address that note has — a
`path` on the web, a `uuid` in Foundry:

```json
{
  "version": 5,
  "package": "thalorna",
  "foundryPackage": "sohl-thalorna",
  "entries": {
    "thalorna-being-grkrahk": {
      "path": "being/grukar-ahk/",
      "name": "Grukar-ahk",
      "uuid": "Compendium.sohl-thalorna.items.Item.WPulW6UO0nVXOVWt"
    }
  }
}
```

**Do not hand-author these.** A manifest asserts that a page exists at the address
it gives; inventing one produces a link that resolves at build time and 404s for
the reader.

**Both addresses are optional.** A note that compiles into no document has no
`uuid`; a pack-only package — compendiums, no site — has no `path` on any entry
(#1516). An address it does not carry is degraded to unlinked text, never
guessed. The full contract is
[The Link Manifest](../../kb/dev-docs/reference/link-manifest.md).

## `path` is relative to the package, not to the site

An entry says where a page sits **inside its own package** and nothing about where
that package is served. Where it is served is this build's knowledge, one line per
package in `PACKAGE_BASE` (`@heroiclands/content-build/engine/kb-manifest`), prefixed when the address is
resolved:

```js
export const PACKAGE_BASE = Object.freeze({
  sohl: "/sohl/",
  thalorna: "/thalorna/",
});
```

A pack-only package needs no entry here: a base exists to resolve a `path`, and
it has none.

So `thalorna-creature-grkrahk` above renders as `/thalorna/creature/grukar-ahk/`. Point the
base at another path (`"/setting/thalorna/"`) or another origin
(`"https://thalorna.example.org/"`) and every inbound link into that package
follows — one string, not 1,473 rewritten entries (#1465).

That split exists because the alternative fails silently. A manifest that recorded
`/thalorna/creature/grukar-ahk/` was asserting a mount point the citing site had to
already agree with; the day the package moved, every link into it resolved, emitted
an `href`, and 404s for the reader — with nothing erroring anywhere.

**A manifest whose values would read differently is rejected, not read.** Version 1
carried a site-absolute `url`, which this build would prefix into
`/thalorna/thalorna/…`. Refresh the vendored copy from the package's own build
rather than editing it in place. `READABLE_VERSIONS` in `@heroiclands/content-build/engine/kb-manifest`
lists what this build accepts — v5 only _relaxed_ v4, so a v4 file is still read
as-is and no package has to re-emit on a schedule.

## What arriving here changes

`@heroiclands/content-build/engine/kb-manifest` lists the packages that exchange manifests
(`LINK_PACKAGES`). While any of them is neither built here nor present as a file
in this directory, cross-package address checking stays **off** and an
unresolved `type-shortcode` address is tolerated — the state before #1446, where
nothing in the syntax separated a legitimate cross-package reference from a typo.

When the last missing manifest lands, the check turns itself on: an address that
resolves in no package fails the build. That is deliberately derived from the
data rather than a flag, so the guard returns the moment it becomes correct
rather than when someone remembers to enable it.

`kethira` is deliberately not in `LINK_PACKAGES`. It ships only compendium packs,
publishes no pages, and must stay withdrawable — a manifest edge pointing into it
would quietly prevent that.
