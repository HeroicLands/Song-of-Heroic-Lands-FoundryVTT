---
"sohl": patch
---

Fate is now offered on attribute tests, and a skill reports the attributes its Skill Base is built from.

**Which attributes a skill uses** — `SkillLogic.skillBaseAttrs` reports the attribute shortcodes a skill's Skill Base is _based on_, ordered primary first. It is read off the parsed formula, so it cannot drift from it: when the formula calls `sb(...)`, that call's arguments are the basis, in the order written; otherwise every referenced attribute is. Backing this, `SafeExpression.callArgMemberRefs()` collects member references from a named helper call's arguments rather than the whole expression.

**Aura no longer over-triggers the no-Fate rule** — a skill was refused Fate whenever `attr.aur` appeared anywhere in its Skill Base formula, including in a term that merely adjusts the result. `sb(attr.str, attr.dex) + attr.aur / 10` is based on Strength and Dexterity and now keeps Fate; only a Skill Base genuinely built on Aura is refused (#1175).

**Fate on attribute tests** — a Fate Point could never be spent on an attribute test: the card's Fate button was gated on `availableFate`, which existed only on skills, and `AttributeLogic.fateMasteryLevel` was declared but never assigned. Attributes now expose the same eligibility set (a general Fate Point, or one associated with the attribute's own shortcode) and roll against a seeded fate mastery level. The Aura attribute's own test can never be fated, matching the rule for Aura-based skills. Mystical Abilities remain outside Fate entirely (#1106).

**The Aura fate bonus now actually applies** — the fate mastery level is seeded from the actor's Aura attribute, but skills built it during `initialize`, before any attribute had computed the mastery level it reads, so the bonus was silently always zero. It is now built in `finalize` — the phase the lifecycle documents for exactly this dependency — and an attribute's mastery level is seeded in `evaluate`, so it is settled before any sibling finalizes.

The Fate spend flow is now shared between skills and attributes as a set of functions over a `FateHost` interface rather than living on `SkillLogic`, deliberately not on their common base class, so a logic type gains Fate only by opting in.
