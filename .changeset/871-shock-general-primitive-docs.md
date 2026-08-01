---
"sohl": patch
---

**Docs: reframe Rules/Shock.md around the general Shock Test primitive**

`Rules/Shock.md` framed every shock trigger as injury (and blood loss). Since the
general Shock Test (#850), any force can drive a shock test by supplying a base SSI.

- Broadened the intro: injury and blood loss are the common causes, but fear and
  other systemic or psychological forces bring shock on the same way.
- Rewrote the Shock State Index section around a general **Shock Test**: a cause
  supplies a **base SSI**, the **Shock** skill roll adjusts it (fatigue applies,
  body-part impairment does not), and the adjusted index maps to a state that is
  **offered** to worsen the current one. Documented the no-roll thresholds — base
  SSI below 5 (no shock) and above 10 (immediately Dead) — and presented **injury**
  (location Shock Value + Injury Level) and fear/systemic forces as sources of a
  base SSI, keeping blood loss as a direct state advance. All existing tables and
  the Re-Test / Extended Shock / Coma content are preserved.

Closes #871
