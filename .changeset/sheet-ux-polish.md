---
"sohl": minor
---

**Being sheet UX polish: field hints, held items, status pills, dossier**

- Field guidance no longer competes with values: the always-on schema hint on
  item and actor sheets becomes a small circled **?** at the end of the label,
  with the hint moved into its tooltip.
- The Combat tab's Held Items dropdowns are widened to 150px and no longer clip
  item names.
- The header status pills are reorganized — top row ASHK / SLP / PRN / FTG,
  bottom row STN / INC / UNC / KIA (DED renamed KIA) — with a **?** legend icon to
  their left whose tooltip explains each abbreviation. The pill abbreviations and
  labels are now localization keys rather than hardcoded strings.
- The Profile tab's _Dossier_ label reads as a section heading (heading
  weight/size with space above) instead of an inline field label.

Closes #669
Closes #670
Closes #671
Closes #672
