---
"sohl": minor
---

**Pick shortcode references from a dropdown when embedded on an actor**

Reference fields that point at another item by its **shortcode** — a Skill's
parent skill (`parentSkillCode`), a Mystery's / Mystical Ability's / strike
mode's associated skill (`assocSkillCode`), and a Trauma's hit location
(`bodyLocationCode`) — used to be free-text inputs, so authoring them meant
knowing the exact shortcode by heart and a typo silently produced a dangling
reference. They now render as a **dropdown** whenever the item is embedded on an
actor: the author picks the target by display name and the field stores the same
shortcode string it always did (no schema change, no migration). A world/pack
item — where no candidate list exists — keeps the free-text input so references
can still be set up ahead of placement.

A stored shortcode that matches no item on the actor is shown as a selected,
flagged `"<code> (unresolved)"` option rather than being blanked, so the value is
preserved and the problem is visible.

Introduces a single reusable widget: a Foundry-free options-builder
(`buildRefOptions` / `actorItemRefOptions`, unit-tested) plus the
`shortcodeRefField` Handlebars partial that the Skill, Mystery, Mystical Ability,
Trauma, and strike-mode sheets all invoke.

Closes #974
