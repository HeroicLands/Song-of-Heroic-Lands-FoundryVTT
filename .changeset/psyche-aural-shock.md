---
"sohl": minor
---

**Psychological Condition & Aural Shock (#560)**

Implement Psyche Stress Levels (PSY) and Aural Shock as psyche traumas, with their
recovery tests.

- **Psyche Stress Recovery Test** — a `psycond`-subtype condition recovers through
  a recurring Will test (every d6 days; fatigue does not apply). `MS`/`CS` recover
  −1/−2 PSY; a Critical Failure is a **Grievous Stress** that turns an _indefinite_
  condition **permanent** (or raises a permanent one's PSY by 1). An indefinite
  condition goes away when its PSY reaches 0. The recovery is a self-sufficient,
  offered action (issue #579) — it never auto-fires.
- **Aural Shock** — an `auralshock`-subtype trauma (1–6, stacking) that inflicts 5
  Weakness Fatigue per level and recovers through a daily Will test (`MS`/`CS`
  recover −1/−2 AS; a Critical Failure grants +1 PSY). Recovered when AS reaches 0.
- **Shared inflictors** — `inflictPsycheStress` / `inflictAuralShock` record each
  instance separately, as the rules require. Fear and Morale route their PSY gains
  through the former.

The pure rule mappings live in a Foundry-free `psyche` module
(`psycheRecoveryOutcome`, `auralShockRecoveryOutcome`, `psychePresentation`,
`weaknessFatigueForLevel`). The ~10-minute behavioral onset and the Aura-test
lockout / automatic-critical-failure gating are follow-ups (the latter joins the
test-resolution auto-critical-failure work).

Part of #548. Closes #560.
