---
"sohl": patch
---

**Fix: show the modifier delta-summary tooltip on Being Combat and Skills value cells**

Hovering a derived value on the Being sheet now shows a tooltip with the
`ValueModifier` delta summary (e.g. `STR +2, ARM ×2`), rendered **above** the row
so it no longer overlaps the values. The tooltip is empty when a value has no
deltas (its effective value is just the base) and shows the disabled marker
(`Dsbl`) when the modifier is disabled.

- **Combat tab:** the strike-mode **Impact**, **Atk**, **Blk**, and **CX** value
  cells (melee and missile) bind `data-tooltip` to the underlying modifier's
  delta summary, with `data-tooltip-direction="UP"`.
- **Skills tab:** the **EML** and **Fate** cells show the mastery-level and
  fate-mastery-level delta summary, surfaced through two new `SkillRow` fields
  (`emlDeltaLabel` / `fateDeltaLabel`) so the flattened skills view model no
  longer discards them before the template.

**API:** `ValueModifier`'s delta-summary getter is renamed from `shortcode` to
`deltaLabel` (and the private `_calcAbbrev()` to `_calcDeltaLabel()`) — the old
name collided with the unrelated document `system.shortcode` identity key. The
getter is computed, not persisted, so no data migration is required.

Closes #769
