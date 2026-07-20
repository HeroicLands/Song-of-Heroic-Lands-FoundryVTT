---
"sohl": minor
---

**Affliction Course Test + Reaction effect**

A symptomatic, naturally-healing affliction now fights its **course**: its
recurring check applies a **Course Test** at each elapsed checkpoint — a headless
test of `Healing Base × Healing Rate` that changes the affliction's Healing Rate
(CF −2, MF −1, MS +1, CS +2). The resulting HR drives the host's **Reaction**:
HR 6+ defeats the affliction (the course stops), HR 5 / 4 inflict 5 / 10 weakness
fatigue, and HR 3 / 2 / 1 / <1 impose Stunned / Incapacitated / Unconscious / Dead
shock (worsening the being's shock state to at least that level, never improving
it). A shared `inflictWeaknessFatigue` helper (also used by blood-loss anemia)
creates the fatigue traumas. Part of #548. Closes #489
