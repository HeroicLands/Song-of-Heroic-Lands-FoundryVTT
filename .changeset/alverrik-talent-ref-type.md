---
"sohl": patch
---

**Fix Álverrik's Talent reference to resolve during actor-pack compile**

Álverrik Tárvallor's embedded `tlnt` item referenced `type: arcanetalent` (a
mystical-ability _subtype_), but embedded items are resolved by document **type**,
and the `Talent` predefined item compiles as `type: mysticalability` (with
`subType: arcanetalent`). The `arcanetalent:tlnt` lookup therefore matched nothing
and the ability was dropped with a `no predefined item` error.

Changed the reference to `type: mysticalability` — matching how every other actor
references a mystical ability and how the item is keyed — so Álverrik now embeds
the Talent ability (subType `arcanetalent`, masteryLevelBase 33). The actors pack
compiles with zero errors.

Closes #725
