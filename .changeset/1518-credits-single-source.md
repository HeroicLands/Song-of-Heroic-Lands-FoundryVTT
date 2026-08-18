---
"sohl": patch
---

Make the credits page the single source for attribution, and correct what was published (#1518).

Attribution was spread across five files that drifted independently. `README.md`
carried a hand-maintained list of ~180 per-icon credits and the font notices;
`assets/icons/game-icons/ATTRIBUTION.md` carried the Game-Icons table; the credits
page added in #1517 pointed back at the README for the icon credits, which pointed
nowhere useful. Two of the README's own licence links had been dead for some time:
`./assets/LICENSE.CC-BY-SA-4.0` and `./LICENSE.GPLv3` do not exist.

**The credits page is now canonical**, and the duplicates point at it rather than
restating it — so there is nothing left to keep in sync and no generator to write.

**The per-icon Noun Project credits moved** into the credits page, all 178 of them.
They were the only record of who made those icons, so this is a move, not a
deletion; the README would otherwise have pointed at a page that pointed back at
the README.

**Fonts are attributed for the first time.** Four bundled families — Cinzel,
Cormorant Garamond, IBM Plex Mono and Signika — shipped with **no attribution
anywhere**, despite the SIL Open Font License requiring the notice be retained.
Every notice is now taken from the `name` table embedded in the shipped `.woff2`
itself, rather than from memory or a secondary source.

**Two published facts were wrong, and are corrected to match the files:**

- _Lankorian Blackhand_ was recorded as CC BY-NC-SA 3.0 AU; the font file states
  the **SIL Open Font License**. The two differ materially — OFL permits
  commercial use, the NC licence does not.
- _Harn Lakise_ and _Harn Runic_ were credited to N. Robin Crossby alone; the font
  files carry "by Amir El Habashy 1995". Both are now named — El Habashy for the
  fonts, Crossby for the scripts they render — and the CC BY-NC-SA 3.0 AU licence
  the README stated is preserved.

**`ATTRIBUTION.md` keeps its table.** It ships inside `assets/icons/`, so it
travels beside the artwork it describes and remains the record that satisfies
CC BY 3.0 for anyone receiving the files; it gains a pointer to the credits page
rather than losing anything. `LICENSE.md` and the verbatim licence texts are
untouched.

Pointers out of the shipped tree are knowledgebase URLs, never repo-relative
paths: `assets/content/` is not copied into the built system, which is how the
README's two links came to be dead in the first place.
