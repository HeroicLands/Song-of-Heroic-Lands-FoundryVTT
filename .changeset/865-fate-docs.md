---
"sohl": patch
---

**Docs: document the Fate mechanic (user rule + developer note)**

The Fate mechanic had no feature-level documentation for either audience.

- **New `Rules/Fate.md` journal entry** — the player-facing rule: spend a Fate
  Point _after_ a test is rolled to raise its success level (never a re-roll);
  Fate Points are held as charges on general or skill-specific Fate Mysteries; the
  Fate Test rolls against a Fate Mastery Level (base 50 + ½ Aura, gated by the Fate
  game option and requiring an Aura); and the rung table (CF: lose/+0, MF: keep/+0,
  MS: spend/+1, CS: spend +2 or keep +1). Linked from the Rules index.
- **Developer mechanism note** in `reference/modifier-model.md` (under _Prior test
  results_) — ties `availableFate` / `fateMasteryLevel` / `fateTest` together,
  documents where points live and the rung→(consume, delta) resolution, and notes
  that Fate sits below the `successStarTable` mapping so it applies to any success
  test via the generic path (no bespoke test type).

Closes #865
