---
"sohl": minor
---

**Migrate the automated attack card onto the action-card framework**

Assemble the automated-combat attack card the same way every action card is
built — a body template plus a `buttons` array handed to `buildActionCard` —
instead of hand-writing the four defense buttons in the template. This makes the
framework's multi-button case (one card, four defenses, all addressed to the
defender) a first-class use of `buildActionCard`, and it fixes a latent
addressing bug in the process.

- `buildAttackCardData` now returns an `ActionCardSpec` (body `data` + a
  `buttons` array); `attack-card.hbs` is body-only. The four defenses (Dodge /
  Counterstrike / Block / Ignore) are emitted as `action-card-button`s carrying
  the evaluated `AttackResult` in each button's `scope` (revived by the resume
  executors as `context.scope.attackResult`), and `skipDialog`.
- **Bug fix:** the defense buttons are now addressed to the defender's
  **combatant** (`AttackCardTarget.combatantUuid`), not its actor. The resume
  executors live on the combatant logic, the click dispatch routes through the
  combatant's `onChatCardButton`, and the render gate reaches the actor via
  `combatant.actor` — so the previous actor-uuid address left a rendered attack
  card's defenses mis-resolved (gated down to Ignore, which then did nothing).
- `gateAutomatedDefenseButtons` reads the handler the same way the dispatcher
  does (`data-handler-uuid`), and per-defender capability gating is unchanged.
- Adds a Node-only test helper (`renderRealTemplate`) that renders SoHL `.hbs`
  with real Handlebars, so the attack card's assembled button HTML — the
  combatant uuid, `skipDialog`, and the `action-card-button` class — is asserted
  without a running Foundry.

Closes #578
