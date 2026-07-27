---
"sohl": patch
---

**Fix: show the modifier abbrev tooltip on Being Combat and Skills value cells**

Hovering a derived value on the Being sheet now shows a tooltip with the
`ValueModifier` abbreviation (its delta summary, e.g. `STR +2, ARM ×2`), so a
player can see how the number was derived.

- **Combat tab:** the strike-mode **Impact**, **Atk**, **Blk**, and **CX** value
  cells (melee and missile) now bind `data-tooltip` to the underlying modifier's
  `shortcode`. The missile rows previously showed a static roll hint instead of the
  derivation; they now match the melee rows.
- **Skills tab:** the **EML** and **Fate** cells now show the mastery-level and
  fate-mastery-level abbrev. The abbreviations are surfaced through two new
  `SkillRow` fields (`emlAbbrev` / `fateAbbrev`) so the flattened skills view model
  no longer discards them before the template.

Closes #769
