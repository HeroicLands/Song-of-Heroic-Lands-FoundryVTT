---
"sohl": patch
---

**`subType` is always required, never defaulted — across every item type**

Every subType-bearing item type now declares `subType` as `required` with no
`initial`: a document must state its kind at creation, and no default is ever
silently substituted. This locks the item taxonomy ahead of the planned
Being-centric beta schema-freeze. Existing worlds are unaffected — every stored
item already carries a `subType`.

- **DataModels made `required` (no default):** `Skill`, `Trauma`, and
  `ProjectileGear` (were `initial`-defaulted to _social_ / _injury_ / _none_).
  `Mystery`, `MysticalAbility`, `Affliction`, `ConcoctionGear`, and the embedded
  action `subType` were already required.
- **Pack builder enforces it:** the new `requireSubType` helper throws when a
  content file omits `subType`, instead of the old per-builder fallback (`""`,
  `"social"`, `"physical"`). A missing subtype is now a build error, surfaced at
  compile time rather than shipped as an invalid (typeless-fallback) item. The
  `mystery` builder, which previously emitted no `subType` at all, now sets it.

**Also** — reconciled the Mystery / Mystical-Ability subtype documentation with
the enums: dropped the phantom **Birthsign** entry from `MysticalAbilityLogic`
(birthsign is a _Mystery_), rewrote `MysteryLogic`'s stale subtype list to the
seven real subtypes (the _Fate_ invocation is a **Divination** Mystical Ability, a
per-skill fate bonus is modelled with **Active Effects**, a fate-point bonus is
deferred), and corrected the `BLESSING`/`BUFF`/`FATE`/`GRACE`/`PIETY` enum
descriptions.

Closes #955
