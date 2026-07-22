---
"sohl": minor
---

**Morale, Rally, and Reaction tests (#559)**

Implement the **Morale Test** (a test of the **Initiative** skill) and its states,
the **Rally Test**, and the **Reaction Test**.

- **Morale Test** — a self-sufficient Being action mapping the roll to a morale
  state (Brave / Steady / Withdrawing, and the CF0/CF5 split of Catatonic vs
  Routed). Each morale-failure source is a `morale`-subtype trauma; the effective
  state is the most severe active one. Routed grants **+1** and Catatonic **+2**
  Psyche Stress; a Brave result grants the shared five-minute **+20** to Morale and
  Fear tests.
- **Reaction Test** — an Initiative test a shaken combatant makes to shake off the
  state: on success a Catatonic victim improves to Routed and any other shaken
  victim snaps back to Steady; on failure it persists.
- **Rally Test** — a leader's Command/Initiative test. Under the Prime Directive a
  rally is **offered, not imposed**: on a success it posts an **open** action card
  any shaken ally's controller may accept to steady their own character (CS) or make
  a Reaction Test (MS); a failure posts an informational card noting the lockout.

The pure rule mappings live in a Foundry-free `morale` module
(`moraleStateFromTest`, `moralePsyGain`, `reactionOutcome`, `rallyOutcome`, and the
effect predicates), reusing the shared state-ladder recorder with fear.

Part of #548. Closes #559.
