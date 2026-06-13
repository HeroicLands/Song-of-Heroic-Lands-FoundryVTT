---
"sohl": minor
---

**Automated combat start on the combatant; opposed tests on the token**

Two entry points move to the document that owns them, paralleling the earlier
relocation of the automated-combat defenses to the combatant.

_Automated combat start_ becomes a single entry point on the combatant:

- `CombatantLogic.automatedCombatStart` is the canonical (ESSENTIAL) action. It
  branches on scope: an `itemLogic`-scoped start (a `logicUuid` naming a weapon
  or combat technique, with an optional `smId`) offers only that item's in-range
  strike modes; a combatant-scoped start offers every in-range mode.
- `WeaponGearLogic` / `CombatTechniqueLogic` `automatedCombatStart` now delegate
  into the attacker's combatant action, passing `{ logicUuid, smId }`, via the
  new `fvttActiveCombatantForActor` helper. The orphaned `BeingLogic.automatedCombatStart`
  is removed.
- `startAutomatedAttackFromActor` is renamed to `startAutomatedAttackFromCombatant`
  and takes the combatant logic. `SohlLogic` gains a `uuid` getter.

_Opposed tests_ (skill-vs-skill, skill-vs-attribute, attribute-vs-attribute)
become token-based:

- `SohlTokenDocument` is registered as `CONFIG.Token.documentClass` and gains a
  transient `.logic` adapter (no DataModel — tokens persist no SoHL state) plus
  `onChatCardButton`.
- New `SohlTokenDocumentLogic` hosts `opposedTestStart` (resolves the source
  skill/attribute by `logicUuid` and runs its test) and `opposedTestResume` (the
  opposed-request card's Respond button addresses the **target token**;
  reconstructs the prior result, lets the defender pick the responding skill or
  attribute, and resolves the contest). The actor is always derived from the
  token.
- `SkillLogic` and `AttributeLogic` `opposedTestStart` delegate into the actor's
  token logic via the new `fvttActiveTokenLogicForActor` helper; the stubbed
  `BeingLogic.opposedTestResume` is removed. The opposed-request card now renders
  a Respond button addressed by token UUID.
