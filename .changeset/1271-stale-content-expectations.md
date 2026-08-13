---
"sohl": patch
---

**e2e: four specs no longer hard-code Basic Folk's content values.** Each failed
deterministically once the compendium packs were rebuilt, because it pinned a
number that content has since moved — the system was correct in every case. The
unarmed combat techniques added for #1252 give Basic Folk intrinsic natural
strike modes, and its attribute scores are now 11 (mastery level 55).

- `gear-equip.cy.js` scoped its "strike-mode rows appear only after `holdItem`"
  assertion to an unqualified `[data-sm-id]`, which the eight intrinsic unarmed
  rows now match with nothing held; it now scopes to the weapon's own rows via
  `data-item-id`.
- `movement-reach.cy.js` used Basic Folk to model "a being with no melee modes",
  which it no longer is (its reach is 2, from Kick/Trip); the empty case now uses
  a bare being.
- `skillbase.cy.js` pinned "25 skills, every skillBase 10"; it now derives the
  expectation from the actor — every attribute shares one score, and averaging
  equal attributes yields exactly that score — with a floor on the roster size so
  an empty result still fails.
- `keep-control-tests.cy.js` pinned Agility/Dexterity at mastery level 50; it now
  reads the attribute's mastery base off the actor and places the competing skill
  relative to it, so the specs pin the better-of selection rule rather than a
  content number.

(Closes #1271.)
