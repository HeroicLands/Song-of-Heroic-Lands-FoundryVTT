---
"sohl": minor
---

**Skill sheet: strike-mode editor for combat-technique skills**

The Skill item sheet now shows a strike-mode editor — Strike Mode (name, min
parts, length, and an optional governing-skill override), Attack (spread,
modifier), Impact (dice/die/modifier), and, for melee, Defense (block,
counterstrike) — but **only** when the skill's subtype is `combattechnique`. It
is hidden for every other skill subtype. Leaving the governing-skill override
blank drives the technique's Attack/Block/Counterstrike from the skill's own
mastery level; setting it to another skill's code borrows that skill's mastery
level instead.
