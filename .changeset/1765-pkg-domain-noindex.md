---
"sohl": patch
---

**The `/sohl/` deployment is no longer indexable at its `pkg` origin address.**
A Cloudflare Pages project answers at three families of host-assigned address
besides its canonical path, and the `_headers` this repository generates covered
only two: `<project>.pages.dev` and `<deployment>.<project>.pages.dev`. The
third, `sohl.pkg.heroiclands.org`, is the custom domain the project carries so
`heroiclands-site`'s router has an origin to fetch — the newest of the three,
and the only one a reader is plausibly handed. `utils/build-site.mjs` now emits a
rule for it as well.

Measured at the edge before the change: `https://sohl-kb.pages.dev/sohl/`
answered with `X-Robots-Tag: noindex`, while the _same deployment_ —
byte-identical body — answered 200 with no such header at
`https://sohl.pkg.heroiclands.org/sohl/`.

**The canonical site stays indexable, by two independent guards.** The rule is
`https://:package.pkg.heroiclands.org/*`, and Cloudflare's `:name` placeholders
match exactly one label, so the pattern requires four labels and a literal `pkg`
— the three-label `www.heroiclands.org` cannot match it under any binding. On top
of that, the router strips `X-Robots-Tag` when it proxies (`canonicalHeaders` in
`heroiclands-site`, `worker/src/router.js`), which its suite asserts both as a
pure function and end to end through the handler.

**This repository keeps its own deploy workflow, and that is now a recorded
decision** rather than an omission. Migrating to the shared reusable workflow in
`HeroicLands/.github` would not have delivered this fix: that workflow writes its
`_headers` payload only when the build produced none, and this build always
produces one. Migrating would also change what is published, because the shared
workflow runs a single npm script and today's `build:site` builds the API
documentation from the working tree rather than from the newest release tag
(#1452). The reasoning is written into `.github/workflows/deploy-sohl.yml`.

`tests/build/site-noindex.test.ts` now models Cloudflare's single-label
placeholder semantics, so "every host-assigned address is covered" and "the
canonical host cannot match" are assertions rather than claims.
