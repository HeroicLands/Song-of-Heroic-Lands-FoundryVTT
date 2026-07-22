---
"sohl": minor
---

**The Pall (#561)**

Implement the Pall — the forces of death that assail **Spirit**.

- **Resist the Pall** — a self-sufficient Being action rolling a Spirit test with a
  **Pall Depth penalty of 5 × total PAL**, mapping the result to a Pall state
  (Immune / Resist / Disturbed, and the CF0/CF5 split of Catatonic vs Terrified). A
  failure accrues Pall Stress Levels (+1 / +2 / +3) on the being's `pall`-subtype
  Pall Cloud trauma; a success grants temporary immunity.
- **Pall recovery** — a recurring Will test (every d6 days) on the Pall Cloud:
  `MS`/`CS` recover −1/−2 PSL (the Pall is expelled at 0); `MF` knocks the victim
  **Unconscious**; `CF` forces the victim to **Face the Pall** — the three fates
  (Embrace / Vacate / Accept True Death) are **offered** as a choice card, never
  imposed (the choice is always the victim's). Offered, not auto-armed (#579).
- **Pall Strength & Cloud math** — a Foundry-free `pall` module: `pallStrengthAt`
  (falloff of 1 per 5 ft plus daylight/twilight reductions), `pallDepthPenalty`,
  `pallResistState`, `pallStressGain`, `pallCloudPenalties` (PSL × 5 to vision
  Perception/Agility, PSL × 10 to Dodge/Move/Stealth), and `pallRecoveryOutcome`.

The application of the Pall Cloud test penalties and the permanent-psyche-trait
permanence conversion are follow-ups (the former joins the test-resolution work).

Part of #548. Closes #561.
