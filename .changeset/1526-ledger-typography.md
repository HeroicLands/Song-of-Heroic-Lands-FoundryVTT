---
"sohl": patch
---

Stop the ledger's numeric columns and group headers from reading as subordinate to their own contents (#1526).

Three settings inverted the visual hierarchy on every ledger-based tab.

**Numeric cells were the smallest and lightest thing in the row.** `ledger__cell`
carried `font-size: 0.92rem` and no weight, so it inherited 400 while the row
label beside it (`ledger__name`) is Signika at 500 and full size. The data the row
exists to convey read as less important than its label. Cells are now `0.96rem`
at weight **500**, matching the label. The size step was never an optical
correction — IBM Plex Mono's x-height (516/1000) is close to the sans it sits
against, so nothing needed compensating.

**A rollable cell jumped 300 weight units past its neighbours.**
`ledger__cell--rollable` was 700 against an inherited 400, so an IMPACT value read
as bold beside a plain ATK in the same row. Now **600** — a step up from the
cells around it rather than a jump.

**A subtype header was smaller than the rows it headed.**
`section-legend--subtype` set its name to `0.92rem`, below the 1rem rows beneath
it, so a weapon group ("Broadsword") or skill group got lost. The rule's own
comment says it should sit "above the paper rows"; the value contradicted it. Now
`1.06rem` at weight 700 — Cinzel is inscriptional caps and reads optically small,
so it needs to clear the rows by more than a hair. This is the shared SubType
header used by 7 templates, so every grouped list gains the same correction.

**The held-item dropdowns did not match their own row.** A `<select>` inherits
neither `font-family` nor `font-size` from its context — browsers apply a UA
default of roughly 13.3px — so the weapon name read visibly smaller than the
"Right Arm" label beside it. `held-item-select` now states both explicitly, and
fills its 14rem ledger column rather than a fixed 150px, since the larger text
needs the room and a full-width control cannot truncate.

**The heading annotation was mono for no reason.** `section-legend__meta` — the
"7 skill(s)" beside a group name — was mono with `tabular-nums`, on the assumption
it held numbers. Four of its six uses are pure prose ("read-only", a movement
unit, a shared-gear note), and the two that do carry a figure are inline counts.
Mono earns its place in this system by aligning digits into columns; a count
inside a heading aligns with nothing, so the face change bought no legibility and
simply read as a different kind of text mid-line. It is now sans at 0.8rem,
keeping the muted colour that marks it as subordinate.

Not addressed here: IBM Plex Mono's dotted zero reads oddly beside Signika. The
shipped subset exposes only `ccmp, dnom, frac, numr` and a single `zero` glyph —
no stylistic sets, no plain-zero alternate — so `font-feature-settings` has
nothing to switch to. That needs a re-subset or a different face.
