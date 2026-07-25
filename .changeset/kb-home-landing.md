---
"sohl": patch
---

**Knowledgebase homepage: KB-specific landing instead of the www marketing hero (#689)**

The knowledgebase root (kb.heroiclands.org) had no home page of its own, so Hugo
fell back to the shared `heroiclands-hugo-theme`'s `layouts/index.html` — the
www.heroiclands.org marketing hero, whose links point at `/thalorna/`,
`/projects/`, and `/blog/` (sections that do not exist on the kb subdomain). The
KB root was therefore indistinguishable from www apart from its `<title>`.

Adds a project-level `kb/layouts/index.html` override that renders a
knowledgebase-specific landing: a hero, primary cards for the developer docs
(`/dev/`) and the user guide (`/guide/`), and a content-reference row linking into
the being, attribute/skill, gear, and affliction catalogs. Only the KB home is
affected; the deep content pages were already correct.
