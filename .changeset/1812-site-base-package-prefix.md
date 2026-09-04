---
"sohl": patch
---

**Publish every knowledgebase content page at the address the link manifest advertises (#1812).**

`site.base` was absent, which meant `/<contentPackage>/`, and the site emitter
writes that value into each page's Hugo `url:` front matter. Hugo reads `url` as
site-root-relative, and this site's root already _is_ `/sohl/` — `kb/hugo.toml`
sets `baseURL` to `https://www.heroiclands.org/sohl/` and `publishDir` to
`../build/site/sohl`, which the deployment serves at `/sohl/`. The prefix was
therefore written twice, and all 1,606 content pages plus the package homepage
published at `/sohl/sohl/<address>/` while every link addressing them said
`/sohl/<address>/`.

Setting `site.base: "/"` leaves the prefix to Hugo alone. Every content page,
the homepage, `sitemap.xml`, the section-landing listings and every inbound
cross-package link now resolve; the 2,988 entries the published link manifest
carries all name a page that exists.

Section landings, the mount, and the `dev-docs` tree were never affected and are
unchanged — they take their address from their path rather than from front
matter.
