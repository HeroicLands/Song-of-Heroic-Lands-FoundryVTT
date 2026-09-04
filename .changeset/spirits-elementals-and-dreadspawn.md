---
"sohl": patch
---

Give the Spirit, Elemental and Dreadspawn creatures a body, natural weapons and
creature skills
([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).

All sixty-eight shipped with an **empty** `system.body.structure` — read as
incorporeal, so no blow could resolve a hit location — no attacks, and no
skills. There is no printed table for any of them, so each is built from its
own Presentation and Attack Methods, on the rules fitted to the printed
animals.

**Three new body plans** join the fifteen already shipped, for creatures no
animal anatomy fits: `amorphous` (Core · Mass · Tendrils) for oozes, mires and
mud golems; `wraith` (Core · Shroud) for a spirit with a shape but barely a
body, following the Umbáth precedent of a short zone run; and `plant`
(Crown · Stem · Tendrils) for the ambulant growths. The `anthropoid`,
`arachnid`, `insect` and `smallQuadruped` plans gain larger size bands so a
stone giant, a scorpion the size of a wagon and a ten-foot beetle can use them.

**Ranged natural weapons.** Four new weapon kinds emit a **missile** strike
mode with a range rather than a zone die: `breath` (a cone, impact
`STR ÷ 3 − 1`, which reproduces the printed Young Dragon's `d4+11` exactly),
`spray` (acid, venom, shards), `hurl` (a thrown rock) and `bolt` (lightning and
light). Range scales with size, fitted to the dragons' 40 / 60 / 80 feet.

**Spirits carry no natural armour.** A shade has no hide; what protects it is
being hard to see and hard to hit, which lives in its Stealth and Dodge. Their
incorporeality — that only enchanted weapons touch them — is prose, not armour.

Eighteen missing attribute scores were supplied across ten creatures that
shipped without a Strength or an Agility, which nothing downstream can derive
around.

The content specification now covers **every** creature, not just the animals:
contiguous gap-free zone numbers, no orphaned parts or locations, no part
without a hit location, unique location shortcodes, a Strength-derived body
scale, and at least one usable technique whose impairing role its body has.
Creature files that still have no anatomy — three Constructs, two Helspawn, and
four family-overview entries carrying no `sohl` block at all — are named in an
explicit allowlist so the remaining gap stays visible and cannot grow.
