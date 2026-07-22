---
"sohl": minor
---

**Fear Test (#558)**

Implement the **Fear Test** — a test against **Will** — and its states. A
self-sufficient Being action rolls the being's Will headlessly and maps the result
to a fear state: **Brave** (CS), **Steady** (MS), **Afraid** (MF), and — splitting
the critical failure by least-significant digit — **Terrified** (CF5) or the more
severe **Catatonic** (CF0).

- **Fear sources are traumas.** Each frightening source is recorded as its own
  `fear`-subtype trauma (its level is the state); the being's effective fear state
  is the **most severe** active one. A success clears the source (Steady, or a
  five-minute **+20 Brave** bonus to Fear and Morale tests); a failure records or
  worsens the source.
- **Psyche Stress.** Terrified grants **+1** and Catatonic **+2** Psyche Stress,
  accrued only for the newly-reached severity (recorded as a `psycond` trauma via a
  shared `inflictPsycheStress` helper).
- The being carries the `fear` status while any fearful source is active, and an
  informational **trauma-state card** reports the outcome (state, PSY gain, and
  effect notes — Block/Dodge only, must-flee, Helpless).

The pure rule mapping lives in a Foundry-free `fear` module (`fearStateFromTest`,
`fearPsyGain`, `mostSevereFear`, and the effect predicates); the per-turn recovery
retests and the combat enforcement of the defense/flee restrictions are wired with
the combat-turn work.

Part of #548. Closes #558.
