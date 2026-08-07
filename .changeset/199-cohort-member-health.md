---
"sohl": minor
---

**Cohort Members tab shows each member's health, and health bands are localized**

The Members roster listed a name and a role but said nothing about the state
the members are in, so a cohort's condition could only be read by opening every
member's sheet.

- Each member row now carries a **health** column showing both the **percentage**
  (of the member's own maximum, so it is comparable across members) and the
  **qualitative band** that percentage falls in. The percentage is colored on the
  same three-stop ramp the Being header uses, so a member reads the same on the
  roster as on their own sheet.
- A member whose actor does not resolve — deleted, or not visible to this client
  — shows an empty health cell, exactly as its name already falls back to the raw
  handle. "No health to show" stays distinct from "at death's door": an absent
  or malformed health reads as _no value_, never as `0%`.
- **Health bands are now localized.** The band (`Excellent` … `Dead`) is an
  internal token; every surface that displays one localizes a
  `SOHL.Health.BAND.*` key instead, via the new pure `healthBandLabel(band)`.
  This also fixes the **Being sheet header**, which rendered the raw token, and
  the print letterhead's health line, which embedded it.

_Note:_ shared gear remains scoped to the cohort's own members by design — gear
shared with a cohort by a non-member is deliberately not gathered.
