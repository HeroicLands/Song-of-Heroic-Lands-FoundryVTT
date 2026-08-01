---
"sohl": patch
---

**Populate the damage card's `data-actor-id`**

The damage chat card now carries the owning (attacking) actor's id in its root
`data-actor-id`, matching the sibling attack, injury, trauma-state, and
rally-offer cards. The builder (`BeingLogic.calcImpact`) previously never set
`actorId`, so `damage-card.hbs` rendered an empty `data-actor-id=""`.

Closes #847
