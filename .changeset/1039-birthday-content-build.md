---
"sohl": patch
---

**Author Being birth dates in content (`traits.birthday` → `birthDate`)**

The content build now consumes a character's `traits.birthday` frontmatter
(format `Y/M/D` era-year / month / day, e.g. `686/4/2`) and writes the
corresponding `Being.birthDate` world-time value into the actors pack — the anchor
the birthsign astrology derives from (#1018). A being without `traits.birthday`
keeps `birthDate: null`.

- **Birth calendar** — an optional `social.calendar` names the calendar the date is
  expressed in (its `shortcode`); when omitted, the build uses the default active
  calendar (Vylarian Reckoning, `vylrec`). An unknown shortcode fails the build.
- **Conversion** — a new Foundry-free helper (`src/utils/calendar-birthdate.mjs`)
  maps `Y/M/D` to seconds, mirroring Foundry's `CalendarData.componentsToTime`;
  `utils/packs/calendars.mjs` resolves the calendar `config` from the shipped
  `calendars/*.json`. The stored value is a calendar-agnostic world-time integer:
  the birth calendar interprets the authored components at build time, and the
  birthsign derivation reads the **active** calendar at runtime (existing #1018
  behavior). `traits.age` remains independent — neither derived from the birthday
  nor validated against it.

Closes #1039
