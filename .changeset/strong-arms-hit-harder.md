---
"sohl": patch
---

_Strength now affects how hard you hit_ (#1253).

A combatant's Strength had no bearing on damage anywhere in the system: two
wielders differing only in Strength dealt identical impact with the same weapon,
and the `noStrMod` trait that exists to suppress the modifier was read nowhere.

**The Strength Impact Modifier** is now folded into every melee blow and every
thrown weapon. It is **computed rather than looked up**, so it extends without
bound in both directions — the printed table stops at Strength 25, while the
system carries creatures from insects to colossi:

| Strength | Modifier                                          |
| -------- | ------------------------------------------------- |
| ≥ 5      | `⌊(STR − 10) / 2⌋` — +1 per two points, unbounded |
| ≤ 4      | `2 × STR − 12` — the steeper low tail             |

Both segments reproduce every printed row exactly and meet cleanly at the seam.

**Bows, crossbows and slings get no benefit** — the force is in the launcher,
not the arm. A thrown weapon does, reduced by 1, and anything flagged
`noStrMod` is excluded outright.

**Off-hand** use reduces the modifier by a further 1, and stacks with thrown. A
grip counts as off-hand only when every limb holding the weapon is on the
non-dominant side, so a two-handed grip never is.

**Dominance** is now a first-class property of a being, read from its Left
Dominance and Right Dominance characteristics: either one alone sets that side
as dominant, while carrying both or neither leaves the being ambidextrous with
no off hand at all. This is the single answer wherever a favored side matters,
not just for impact. A body part's own side is derived from its shortcode and
the presence of its mirror twin, so a central part correctly belongs to neither
side.

Each contribution lands as a named delta — `StrImp`, `OffHnd`, `Thrwn` — so the
impact breakdown shows the derivation instead of burying it in the total. The
modifier is applied during the finalize phase, so a weapon's sheet and its
attack card agree.

Also moves Photophobia from a Fear trauma to a physical condition.
