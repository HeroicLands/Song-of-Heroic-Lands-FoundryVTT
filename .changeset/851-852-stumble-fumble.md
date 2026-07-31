---
"sohl": minor
---

**Stumble and Fumble intrinsic actions**

Implement the two "keep control of your body" tests a combat mishap can flag, both
previously stubbed to return `null`:

- **Stumble** (#851) — a keep-your-footing test rolling the **better of** the
  being's Agility attribute and Acrobatics skill.
- **Fumble** (#852) — an avoid-dropping test rolling the **better of** the being's
  Dexterity attribute and Legerdemain skill.

Each sources its abilities from the **current** attribute/skill model (the removed
`trait` item is gone), picks the higher effective mastery level (ties to the
trained skill; either ability alone when the other is absent), and drives the one
well-tested `MasteryLevelModifier.successTest` path. The bespoke keep-control
result text ("Keeps Footing", "Stumbles", "Drops It", …) travels as **data** — a
`successStarTable` passed in the action scope — rather than new bespoke test code,
and renders on the standard test card. Both actions are **offered, never
auto-performed**: they run only when the target's controlling player picks them
(the attack card surfaces the flagged mishap as a prompt).

Adds a Foundry-free `keepControlTable` builder, keep-control result-text
localization keys, unit coverage (better-of selection in both directions, the
no-ability guard, and the rendered card), and a Cypress e2e
(`keep-control-tests.cy.js`).

Closes #851
Closes #852
