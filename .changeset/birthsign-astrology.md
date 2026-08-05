---
"sohl": minor
---

**Birthsigns are now derived from a birth date and an astrological tradition, not a marker item**

A character's birthsign is no longer a hand-created `BIRTHSIGN` Mystery item with
its effects scattered across every affected skill's Skill-Base formula. It is now
a **derived** property: a pure function of the being's **birth date** interpreted
through an **astrological tradition**, applied as a per-skill mastery-level
modifier (`BSMod`). Closes #1018 and its sub-issues #1021–#1028.

**New data homes** — additive, so existing worlds read them as unset:

- `Being.birthDate` — the being's birth date as a world-time value (also the
  anchor for age and calendar birthdays).
- `Affiliation.astrologicalExpression` — a `SafeExpression` that derives the
  being's birthsign modifiers. **Presence is identity:** a non-empty expression
  makes the affiliation a _birthsign affiliation_; the affiliation's existing
  `society` names the **tradition**.

**Astrology traditions registry** — a world-setting-backed map of traditions
(built-in defaults + per-world overrides), keyed by `society`, edited through a
new **Astrology Traditions** settings menu (import/replace or clear from a
validated JSON file). Each sign carries a date window, cusp width, and a map of
skill-shortcode or `subtype:<skillSubType>` modifiers. The system ships the
**Astrokýklos** — Thalorna's twelve-sign tradition — as its built-in default.

**New `SafeExpression` helpers** — `astrologySign` / `astrologySettings` /
`astrologySetting` (fed the resolved registry through a new context-injection
seam), plus the general-purpose `merge` (a per-key fold with a registry-resolved
pure combiner — `max` / `min` / `sum`), `settings` (a dict builder), and `sum`.
The default per-being expression is
`merge(astrologySettings(tradition, date), "max")`.

**Consumption** — `SkillLogic` adds a `BSMod` mastery-level delta from the being's
combined birthsign dict, with a specific skill shortcode overriding a `subtype:`
wildcard. Combat techniques and Mystical Abilities inherit it automatically
through the mastery-level merge.

**Breaking (pre-beta — no migration provided):**

- The `BIRTHSIGN` Mystery subtype and the `birthsignBonus` Skill-Base helper are
  **removed**. As the system is pre-beta, no data migration ships: re-author
  birthsigns via a birthsign Affiliation + the being's birth date, drop any
  leftover `BIRTHSIGN` Mystery items, and remove `birthsignBonus(...)` terms from
  Skill `skillBaseFormula`s.
