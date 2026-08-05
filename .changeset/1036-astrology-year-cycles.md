---
"sohl": minor
---

**Birthsign astrology: arbitrary & concurrent year cycles, plus `year` in context**

Extends the birthsign astrology model beyond intra-year solar/date-window signs to
support **cyclic** birthsigns keyed off the birth **year** — any number of
concurrent cycles of arbitrary length (a 12-year animal cycle, a 60-year
sexagenary cycle, …), each contributing its own per-skill modifiers. Additive and
migration-free: no change to `Being.birthDate`.

- A tradition may now declare `cycles`, each with a `cycleLength`, an `epochYear`,
  and an ordered list of per-position `skillModifiers`. A tradition may be purely
  solar, purely cyclic, or both. Cycles are world-authored data, validated on load
  (a malformed cycle or position is skipped, never fatal).
- New pure model in `sohl.entity.astrology`: `positionsForYear` /
  `positionForYear` / `positionIndexForYear`, and a leap-aware
  `monthLengthsForYear`.
- New expression helpers: `astrologyYearSettings(tradition, year)` and
  `astrologyYearSign(tradition, year)` (context-bound, mirroring the solar
  helpers), plus the pure `yearInCycle(year, cycleLength, epoch?)`.
- `merge` is now variadic — `merge(listA, listB, "max")` folds several dict lists
  together, so a solar list and one or more cycle lists combine into one `BSMod`
  result through the existing pipeline (no new consumption path in `SkillLogic`).
- `year` is surfaced in the injected astrology context, and the Foundry boundary
  now computes month lengths for the birth date's **actual year** (leap-aware) —
  exact for fixed-length calendars, correct near a cusp on calendars whose month
  lengths vary by year.

Closes #1036
