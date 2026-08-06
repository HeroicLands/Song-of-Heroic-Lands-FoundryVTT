---
"sohl": minor
---

**Icon Legend** — a generated user-guide page showing every icon the system uses
and what it means, so a glyph spotted on a sheet or in a context menu can be
looked up (#1110).

The page is built from the code that defines the icons — `ITEM_METADATA`,
`ACTOR_METADATA`, the Being sheet's `TABS`, and the `iconFAClass` of every
intrinsic action — with names resolved through `lang/en.json`, so it cannot
drift from the interface it documents. The generator fails the build if any
section matches nothing, rather than silently publishing an empty legend.

Each row renders the _real glyph_ rather than naming a CSS class. Both
publishing targets already pass raw HTML through (`markdown-it` with
`html: true` for journals, goldmark `unsafe = true` for the knowledgebase), so
one source produces working icons in both.

|                             |                                                 |
| --------------------------- | ----------------------------------------------- |
| `npm run build:icon-legend` | regenerates the page                            |
| `npm run build:kb-icons`    | emits the webfont + CSS the knowledgebase needs |

The knowledgebase loaded neither icon family, so `build:kb-icons` emits a
stylesheet plus a game-icons webfont **subset to the glyphs the docs actually
reference** — 12 glyphs, 3.4 KB, down from 970 KB for the full set. Font Awesome
is loaded from a CDN as its free set; SoHL uses no Pro-only icons.
