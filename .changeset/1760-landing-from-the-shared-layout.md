---
"sohl": patch
---

**`/sohl/` is authored content rendered by the shared landing layout, not a
hand-built page with a stylesheet of its own.** `kb/layouts/index.html` carried
185 lines of markup and a 71-line inline `<style>` block declaring `.install`,
`.install-note`, `.install-url`, `.doors`, `.door`, `.lead`, `.lead-centred` and
`.section-heading`. That was a per-page stylesheet living in a package
repository: it took no part in the theme's palette tokens, so it could not follow
a light scheme with the rest of the site, and it was the thing the next package
would copy. The layout that removes the need for it now exists, so the whole file
is deleted.

The page is now `assets/content/homepage.md` — a `type: homepage` note whose
`landing:` front matter carries the lead, the install block, the three doors and
the closing line — rendered by `@heroiclands/hugo-theme`'s
`layouts/partials/landing.html`. The theme moves to `^0.2.0`, the release that
ships that layout and the landing classes; the pin has to be widened by hand,
since on `0.x` a caret range never crosses a minor.

**What the reader gets is the same page.** The site was built three times — at
0.1.2, at 0.2.0 with nothing else changed, and with the port — so the minor bump
and the port could be told apart. The bare bump changes **no rendered page at
all**: its only effect on the whole 1,705-page site is `css/style.css`, purely
additive at 163 lines added and none removed. The port then changes exactly one
file, the root `index.html`. The install URL, the required Foundry version, the
three doors and every link out are all still there, and every one of the fifteen
rules in the deleted `<style>` block is present verbatim in the shared
stylesheet.

Four differences are real and deliberate:

- **Two dead links are fixed.** _What it ships with_ pointed at `kb/creature/`
  and `kb/character/`, which have 404'd since those types merged into `being`
  (#1580). They are one working link to `kb/being/`.
- Because a card's links are one per row, that door's combined rows —
  "Weapons, armour, and gear", "Afflictions and trauma" — are now a row each.
  Every destination they reached is still reached.
- Prose is markdown now, so apostrophes are curled.
- The page supplies its own `description`, so `<meta name="description">` is the
  landing's standfirst rather than the site-wide default.

Nothing under `/sohl/kb/` or `/sohl/api/` moves; the knowledgebase tree is
byte-identical, and `build/packs-json` is byte-identical with and without the new
note, since a `type: homepage` note compiles to a page and to no compendium
document.
