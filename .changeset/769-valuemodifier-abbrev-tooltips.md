---
"sohl": patch
---

**Fix: show the modifier derivation tooltip on Being Combat and Skills value cells**

Hovering a derived value on the Being sheet now shows a tooltip describing how
the value is derived — the base contribution followed by each modifier, e.g.
`Base +30, SSMod +25` — rendered **above** the row so it no longer overlaps the
values. A value with no modifiers still summarizes as `Base +30`; a disabled
value shows `Dsbl`.

- **Combat tab:** the strike-mode **Impact**, **Atk**, **Blk**, and **CX** value
  cells (melee and missile) bind `data-tooltip` to the modifier's derivation
  summary, with `data-tooltip-direction="UP"`.
- **Skills tab:** the **EML** and **Fate** cells show the mastery-level and
  fate-mastery-level derivation, surfaced through two new `SkillRow` fields
  (`emlDeltaLabel` / `fateDeltaLabel`).

**`ValueModifier` changes**

- The derivation-summary getter is renamed from `shortcode` to **`deltaLabel`**
  (and the private `_calcAbbrev()` to `_calcDeltaLabel()`) — the old name
  collided with the unrelated document `system.shortcode` identity key. It is a
  computed getter, not persisted, so no data migration is required.
- `deltaLabel` now leads with the base contribution (`Base +N`) so an unmodified
  value has a meaningful summary instead of an empty one.
- Fixed a staleness bug where an **enabled** impact could show a stale `Dsbl`
  summary: the base constructor's eager `_apply()` ran before a subclass set its
  own apply-affecting fields (e.g. `ImpactModifier`'s dice `roll`), caching the
  wrong summary. Each modifier constructor now runs its `_apply()` as the
  most-derived class, after all its fields are set.

**`ValueDelta` change**

- `ValueDelta`'s identity property is renamed from `shortcode` to **`abbrev`**
  (and the `VALUE_DELTA_ID` registry entries from `{ name, shortcode }` to
  `{ name, abbrev }`) — a delta's short source label is an abbreviation, not the
  document `system.shortcode` identity key, and sharing the term was confusing.
  The `add`/`multiply`/`set`/`floor`/`ceiling`/`get`/`has`/`delete` argument
  named `shortcode` is likewise now `abbrev`. Deltas are never persisted, so no
  data migration is required.

Closes #769
