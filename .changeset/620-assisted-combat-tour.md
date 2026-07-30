---
"sohl": minor
---

**Assisted Combat guided tour**

A new `SohlTour` — the second content tour after Character Creation — that
teaches the Assisted Combat loop hands-on. It is **single-actor and "pretend"
throughout**: no token, no scene, no encounter, and no required attack ordering,
reflecting that Assisted Combat is an unopinionated _improved roll mechanic_. It
coaches one Being you already own from a weapon on the sheet through an attack, an
impact, and a recorded injury, while making explicit that (a) ATK / BLK / CX /
Impact / Resolve Injury are each **independent** and runnable at any time, and (b)
the system **rolls but does not adjudicate** — the opposed outcome is read off the
**rulebook** (the tour's "pretend the broadsword hit" stands in for that human
step).

Two acts plus an independence call-out: arm the Being with a one-handed weapon, a
two-handed weapon, a bow, and a shield _(gated on the archetypes)_; learn the
two-handed **arm rule** — a bow held in one arm shows no strike mode, held in both
its Ranged mode appears _(gated on the bow held in two limbs)_; roll ATK / BLK / CX
and compute Impact _(free/advisory)_; then run the **Resolve Injury** action to
create a wound from the impact-card values, and again from GM-given aspect + impact
with **no roll at all** _(gated on a wound being recorded)_. Treatment is left to a
future tour.

Registered in **Tour Management**, referenced from the Combat Basics user guide,
and covered by a new Cypress e2e (`assisted-combat-tour.cy.js`).

Closes #620
