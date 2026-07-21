---
"sohl": minor
---

**Infection lifecycle**

A poorly-treated wound can now fester into an infection, completing the injury
recovery model (the deferred infection branch of #486).

- **Infectable wounds** — the Treatment Test (#553) now marks a wound `infectable`
  when it is treated poorly (a failed roll); a marginal/critical success clears
  the risk.
- **Contraction** — a Critical-Failure Injury Healing Test on an infectable wound
  contracts an **infection**: a separately-recorded `infection`-subtype trauma
  (Injury Level "X", aspect "Inf") starting one Healing Rate step above the wound
  it came from.
- **Halts injury healing** — while any infection is active (Healing Rate below 6)
  no Injury Healing Tests are made for the patient.
- **Infection Healing Test** — the infection recovers through the shared course
  test (`Healing Base × Infection Healing Rate`, fatigue applies): the Healing
  Rate shifts by the result (CF −2 / MF −1 / MS +1 / CS +2, floored at 1 — an
  infection never kills), it saps weakness fatigue by its Healing-Rate band
  (HR 1–2 → 10, HR 3–4 → 5, HR 5+ → none), and at Healing Rate 6 it heals, letting
  normal injury healing resume.

Closes #557
Part of #548
