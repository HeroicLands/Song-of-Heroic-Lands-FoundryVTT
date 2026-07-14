---
"sohl": patch
---

**API site — shared Heroic Lands brand chrome (#433)**

The generated API docs (api.heroiclands.org) now wear the same masthead, footer,
palette, and fonts as www.heroiclands.org and the Hugo knowledgebase, so the three
properties read as one site.

A TypeDoc plugin (`utils/typedoc-plugin-brand-chrome.mjs`) injects the chrome
through the renderer's page hooks rather than forking the theme: `head.end` adds
the shared web fonts and a scoped stylesheet that recolors TypeDoc by overriding
its `--{light,dark}-color-*` source variables with the brand palette (so the
generated content restyles through TypeDoc's own cascade, in either theme) and
carries the `.site-header` / `.site-footer` component rules; `body.begin` and
`body.end` add the static masthead and footer, with absolute www URLs for
cross-domain navigation. The TypeDoc three-column layout, navigation, and search
are unchanged underneath.

Also repoints the TypeDoc symbol-map plugin to emit `kb/data/api-symbols.json`
(a Hugo data file) instead of the retired `kb/src/`.
