---
"sohl": patch
---

**Knowledgebase — Hugo site on the shared Heroic Lands theme (#418)**

Stands up the knowledgebase (kb.heroiclands.org) as a Hugo site built on
`HeroicLands/heroiclands-hugo-theme` — the same brand theme that renders
www.heroiclands.org — so the KB shares its header, footer, palette, fonts, and
info-block sidebars rather than reinventing them. The theme is vendored as a git
submodule under `kb/themes/`.

A content-prep step (`utils/build-kb-content.mjs`) is the analogue of the main
site's vault exporter: it reads the authoritative `assets/content/` tree (SoHL
package) plus the repo's `docs/`, supplies the `title` Hugo needs (from
`name.full`), and routes each page into Hugo's content tree — reference pages by
frontmatter `type` (so the theme dispatches the right infobox: weapon profile,
character sidebar, …), developer docs under `/dev/`. The rendered `kb/content/`
and `kb/public/` are build artifacts (gitignored); `npm run build:kb` regenerates
and builds them, and `deploy-kb.yml` publishes `kb/public` to Cloudflare Pages,
checking out the theme submodule.

This supersedes the earlier Astro/Starlight scaffold: the pivot to Hugo reuses
the polished site theme wholesale, so the KB looks like one coherent property with
www and the API site. The TypeDoc symbol-map plugin (`{@link}` → API URL) now
emits to `kb/data/api-symbols.json`; wiring the developer docs' `{@link}`
resolution through it in Hugo is a follow-up under #418.
