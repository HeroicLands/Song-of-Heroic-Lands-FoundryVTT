---
"sohl": patch
---

**Dodge is offered only when the actor has a usable Dodge skill**

Previously the Dodge defense button appeared for every defender regardless of
whether they had a Dodge skill.

**Two gates fixed:**

- **Automated chat card** (`chat-card-gating.ts`): Added `hasUsableDodgeSkill(actorLogic)` helper that checks `logicTypes[ITEM_KIND.SKILL]` for a skill with shortcode `"dge"`. `gateAutomatedDefenseButtons` now removes the Dodge button when the helper returns false — mirroring the existing Block/Counterstrike gates.
- **Context menu** (`constants.ts` + `ExpressionHelperRegistry.ts`): `TEST_TYPE.DODGE.condition` changed from `"true"` to `"hasUsableSkill(actor,'dge')"`. Added `hasUsableSkill(actor, shortcode)` to `STANDARD_HELPERS` — a pure, duck-typed helper that walks `actor.logic.logicTypes["skill"]` to find the skill, with no Foundry import required.

Closes #64.
