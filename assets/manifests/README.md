# Vendored link manifests

One `<package>.json` per package this repository links **into** but does not
publish — the cross-package link manifest described in #1446.

Each file is produced by that package's own knowledgebase build (`build/manifests/`)
and copied here. It maps a note's canonical `type/shortcode` address to the
`{ url, name }` needed to render a link to it:

```json
{
  "version": 1,
  "package": "thalorna",
  "entries": {
    "creature/grkrahk": {
      "url": "/thalorna/creature/grukar-ahk/",
      "name": "Grukar-ahk"
    }
  }
}
```

**Do not hand-author these.** A manifest asserts that a URL exists; inventing one
produces a link that resolves at build time and 404s for the reader.

## What arriving here changes

`utils/kb-manifest.mjs` lists the packages that exchange manifests
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
