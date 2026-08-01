---
"sohl": patch
---

**Docs: document Stumble/Fumble resolution (keep-control tests)**

The docs described when a fumble/stumble mishap is flagged but never the
keep-control test that resolves it (#851/#852). Added the resolution for both
audiences.

- **`reference/body-structure.md`** — a developer note under the mishap-checks
  list: Stumble rolls the better of Agility/Acrobatics (a failure falls prone),
  Fumble the better of Dexterity/Legerdemain (a failure drops the held item); ties
  go to the trained skill; both are offered, never auto-performed; each is an
  ordinary `successTest` fed a `keepControlTable` (cross-linked to the
  graded-test-as-data recipe and the combat mishaps `Set`).
- **`Rules/Body_Structure.md`** — a player-facing rule extending the existing
  Fumble/Stumble locations paragraph: what each keep-control test rolls, that a
  failure falls prone / drops the item, the better-of-attribute-or-skill selection,
  and that the test is offered on the flagging attack, never imposed.

Closes #867
