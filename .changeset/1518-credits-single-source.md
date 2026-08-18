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

**Fonts are attributed for the first time.** The four families the system renders
with — Cinzel, Cormorant Garamond, IBM Plex Mono and Signika — shipped with **no
attribution anywhere**, despite the SIL Open Font License requiring the notice be
retained. Every notice is taken from the `name` table embedded in the shipped
`.woff2` itself, rather than from memory or a secondary source.

**The three Hârnic-script fonts are removed** — Harn Lakise, Harn Runic, and
Lankorian Blackhand — along with every claim made about them.

Checking each notice against the `name` table embedded in the shipped `.woff2`
showed the recorded attribution could not be relied on. The README credited the
Lakise and Runic fonts to N. Robin Crossby, but neither file mentions him — both
carry "by Amir El Habashy 1995" — which left the CC BY-NC-SA 3.0 AU licence the
README also stated resting on the same disproved line. Lankorian Blackhand was
likewise recorded as CC BY-NC-SA 3.0 AU while its file states the SIL Open Font
License, a materially different grant.

Rather than publish attribution whose provenance could not be established, the
fonts go: three `.woff2` files and the three `@font-face` declarations that
defined them. All three were **never applied** — no token, component, template,
or manifest referenced any of the families — so nothing renders differently.

The four typefaces the system actually uses are unaffected and now attributed for
the first time.

**`ATTRIBUTION.md` keeps its table.** It ships inside `assets/icons/`, so it
travels beside the artwork it describes and remains the record that satisfies
CC BY 3.0 for anyone receiving the files; it gains a pointer to the credits page
rather than losing anything. `LICENSE.md` and the verbatim licence texts are
untouched.

Pointers out of the shipped tree are knowledgebase URLs, never repo-relative
paths: `assets/content/` is not copied into the built system, which is how the
README's two links came to be dead in the first place.
