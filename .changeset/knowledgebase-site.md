---
"sohl": patch
---

**Knowledgebase site (kb.heroiclands.org) on the shared Heroic Lands theme (epic #418)**

Stands up the knowledgebase as a Hugo site built on the shared
`heroiclands-hugo-theme` — the same brand theme behind www.heroiclands.org — so the
KB shares its header, footer, palette, fonts, and info-block sidebars and reads as
one property with www and the API site. This supersedes the earlier Astro/Starlight
scaffold, reusing the polished theme wholesale.

- **Content-prep pipeline** (`utils/build-kb-content.mjs`), the analogue of the main
  site's exporter: reads the authoritative `assets/content/` tree plus the repo's
  `docs/`, supplies the `title` Hugo needs, and routes each page into Hugo's content
  tree by frontmatter `type` (reference pages get the right infobox; developer docs
  go under `/dev/`). The rendered output is a gitignored build artifact.
- **Being reference pages** — beings render with portrait, profile, attribute grid,
  categorized skills, and equipment, derived from the note's embedded `sohl.items[]`
  resolved against a content-wide `<type>:<shortcode>` index.
- **Link resolution** — inline `{@link}` / `{@linkcode}` / `{@linkplain}` tags
  resolve against the TypeDoc symbol map to api.heroiclands.org links, and relative
  `*.md` / source links rewrite to KB dev routes or GitHub blob URLs, both guarded
  to skip fenced code and inline code spans.
- **Shared nav** — picks up the theme's Projects-dropdown hover-gap fix and the
  API/KB cross-links.

Covers #418, #429, #435, #437, #442.
