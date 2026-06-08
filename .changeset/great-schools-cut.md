---
"sohl": minor
---

**Automated combat resolution**

Implements the **Automated** combat mode described in
`docs/reference/combat-modes.md`: a single attack → defend → resolve → injury
chain walked through chat cards with minimal player input. Builds on the
assisted pipeline and the `CombatResult` resolution engine.

- **Attack initiation** — an automated attack resolves the target and distance
  first, then offers only the strike modes that can reach right now: melee by the
  mode's reach, missile by the weapon's **base range**. **Volley** (a missile
  beyond base range) is an area attack with no aim and is **not supported**; a
  wholly out-of-range target short-circuits. The picker defaults to the
  most-recently-used mode, else the best chance to hit. Posts an attack card.
- **Missile mechanics** — a direct shot at **point-blank** range (≤ half base
  range) is more precise (spread 6) and hits a little harder (impact +2); a
  normal direct shot is spread 8. Melee precision is the strike mode's `spread`.
- **Defender response** — the attack card's **Block / Counterstrike / Dodge /
  Ignore** buttons each resolve on the *defender's* client, assemble the
  `CombatResult`, and post the combined outcome. **Counterstrike** is modelled as
  a second attack (the defender slot becomes an `AttackResult`), so both sides can
  land and the card can carry two injury buttons. Buttons are gated at render
  time: only the defender's owner (the GM owns all) sees them, Block/Counterstrike
  appear only when the defender has a capable mode, and an **incapacitated**
  defender (unconscious/asleep/restrained/paralyzed/frozen/incapacitated) is
  reduced to **Ignore** only.
- **Injury** — the result card forwards the full aim payload (`targetPart` +
  `spread`) so the wound resolves with no dialog, reusing the existing injury
  pipeline.
- **Combatant-based model** — automated combat is between **combatants**, not
  arbitrary tokens. Targeting keeps only the targeted tokens that are combatants
  of the active combat (exactly one required); the orchestration API takes a
  `SohlCombatant` throughout (token/actor/distance derived from it). The
  most-recently-used attack/block mode persists on `SohlCombatantDataModel`.
- **Invariants** — checked up front, aborting immediately with a player-facing
  notification: attacker and defender must be combatants in the same active
  combat; the attacker must not be dead/defeated/unconscious/asleep/restrained/
  paralyzed/frozen/incapacitated; the target must not be dead. Documented in
  `docs/reference/combat.md`.
- **Status effects** — a single `STATUS_EFFECT` constant lists every status
  (Foundry standard + SoHL), a new **Evading** status (`evade`) was registered,
  and the combat call sites use the constant instead of string literals.
- **Architecture & docs** — established **actor state sovereignty** (an actor
  mutates only itself; cross-actor effects go through a target-addressed chat
  acknowledge button resolved on the target's client) and a **message-channel**
  discipline (in-world events → chat cards; client/player errors → UI
  notification + console; dev diagnostics → console). Both documented in the
  concept/how-to/reference docs and the user guide.

Resolution helpers (range/spread classification, mode gathering, best-mastery,
status predicates, card assembly) are Foundry-free and unit-tested; the
orchestration glue (dialogs, tokens, chat posting, persistence) is Foundry-bound
and requires in-app verification.
