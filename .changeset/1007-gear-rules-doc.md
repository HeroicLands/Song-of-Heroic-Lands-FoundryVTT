---
"sohl": patch
---

**Docs: add a Gear rules journal (gear types, Strike Modes, encumbrance)**

The Rules journal had no player-facing coverage of gear.

- **New `Rules/Gear.md` journal** — the common gear properties (quantity, weight,
  value, quality, durability, carried state, containers); the carrying &
  encumbrance model (only carried gear burdens the character); and a page per gear
  type: Miscellaneous, Container, Weapons, Projectiles, Armor, and Concoctions.
  Armor covers worn vs. carried, the encumbrance rules (worn armor weight is
  excluded from encumbrance; carried-but-not-worn armor counts), the optional
  per-item encumbrance value added when worn, protection graded by aspect
  (Blunt/Edged/Piercing/Fire) with impact absorbed and the remainder passing
  through, armor layering, coverage of one or more locations each flexible or
  rigid, and the sensory-perception penalties certain armor (notably helmets)
  impose. Weapons note their optional encumbrance value and their one-or-more
  strike modes.
- **New `Rules/Strike_Modes.md` journal** — strike modes as an independent
  concept shared by weapons and combat techniques: a mode is a particular way of
  using a weapon (a sword's cut, thrust, or pommel), each with its own aspect,
  impact, and required body-part count; a mode is unusable when fewer than the
  required body parts are available; and the melee (reach, block, counterstrike)
  and missile (projectile type, range, draw, volley) specifics.
- **`Rules/README.md`** gains a _Gear & Equipment_ section linking both journals.

Closes #1007
