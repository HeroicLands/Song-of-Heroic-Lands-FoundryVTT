---
"sohl": minor
---

**Mysteries and Affiliations for the Vehicle and Structure sheets**

A ship can bear a ward and a shrine can hold a consecration, but neither sheet
could show one: Mysteries and Mystical Abilities could be embedded on the actor
and were invisible. Nor could either say whose they were.

- The Being's Mysteries tab was never Being-specific — its template renders one
  section per subType and its context builder reads only
  `actor.itemTypes[MYSTERY]` / `[MYSTICALABILITY]` through shared helpers. The
  template is promoted to `templates/actor/parts/mysteries.hbs` and the builder
  to `SohlActorSheetBase`, dispatched for any sheet declaring the part. The
  **Vehicle** and **Structure** sheets now declare it; the Being inherits both
  unchanged. The Cohort does not get one — its tabs are Facade, Profile,
  Members, Shared Gear, Actions, Effects.
- The shared **Profile** tab gains an **Affiliations** section, so an actor that
  can carry a mystery can also say who it answers to — a ward laid by an order,
  a keep held for a house, a ship under charter.
- **The Gear tab drops its capacity readout** where there is nothing to read.
  Capacity is deliberately not modeled for vehicles or structures, so the base
  reported a bare total that nothing acts on — and, having no maximum, it
  rendered as a dangling `Capacity: 12.5/`. Sections now show a readout only
  when they have one: a being's carried weight and encumbrance, or a container's
  used-against-max.
