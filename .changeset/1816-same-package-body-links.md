---
"sohl": patch
---

**Write same-package knowledgebase links at the address they are served from (#1816).**

Every wikilink rendered into a page body pointed one path segment too shallow —
`href=/doc-arlshck/` for a page served at `/sohl/doc-arlshck/` — so 3,902 links
across 1,321 distinct targets 404'd. Links into the `dev-docs` tree were dead the
same way. Section landings, the `dev-docs` pages themselves and every
cross-package inbound link were unaffected, so the site's own navigation worked
while the prose was dead end to end.

The emitter wrote `site.base` into two quantities that need opposite framings:
Hugo's `url:` front matter, which Hugo already resolves under `baseURL`
(`.../sohl/`), and the `href`s and manifest base, which are site-absolute and
must carry the prefix themselves. No single value was right for both — absent
(`/sohl/`) published every page at `/sohl/sohl/<address>/` (#1812), and the
`site.base: "/"` stopgap bought the addresses back at the cost of the body links.

`@heroiclands/package-build` 15.0.0 stops writing `base` into `url:`
(package-build#217, #219), so the default is right for both halves; taking it and
deleting the stopgap is one change. All 1,705 rendered pages keep their address,
all 2,988 link-manifest entries still name a page that exists, and no
`/sohl/sohl/` directory is produced. The 46 site-absolute links still unresolved
in this tree are the ones it does not build — 43 into `/thalorna/` and three into
`/sohl/api/`, which `site:assemble` supplies.

Its other two majors are inert here. `resolveImg` now distinguishes an unset art
path from a deliberately blank one (package-build#218, #221) — no note in
`assets/content/` writes `img: ""` or `portrait: ""`. And a note's own `title` no
longer fills an `affiliation` item's `system.title` (package-build#218, #222) —
this tree authors no `type: affiliation` note; the only trace is the regenerated
item-field reference, which now says so under the affiliation table.
