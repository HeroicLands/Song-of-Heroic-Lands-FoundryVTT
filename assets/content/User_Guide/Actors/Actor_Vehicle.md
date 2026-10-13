---
shortcode: vehicleug
name: {full: "Vehicle"}
type: doc
subType: userguide
tags: [guide-actors, user-guide-actors-sections]
data: {packFolder: actors}
---

# What Is a Vehicle?

A Vehicle is a **conveyance that carries people** — a wagon, a ship, a boat, a cart. It is the thing the party travels _on_, and the thing their cargo travels _in_.

A Vehicle records its occupants, its passenger and carrying capacities, and its current load. Each occupant has a role — **crew**, **passenger**, or **draft creature** — and an optional title such as _Bosun_ or _Helmsman_. An entry may name a single character or a whole [[doc-cohortug|Cohort]], which stands for that cohort's resolved members riding along.

That is the question a Vehicle exists to answer: **who is on board, and in what capacity.** Everything else it does — holding cargo, carrying actions, taking effects — any actor can do.

Like every actor, a Vehicle carries movement rates for the mediums it can travel in, so a river barge and a mountain wagon can be given different speeds.

# When to Use a Vehicle

Use a Vehicle when:

- The party travels by ship, wagon, cart, or boat, and it matters who is aboard
- You want the crew and the passengers distinguished, and a captain named
- Cargo and stores should live with the conveyance rather than in someone's pack
- The conveyance has a travel speed of its own

For a fixed place that does not move — a building, a wall, a bridge — use a [[doc-structureug|Structure]] instead.

# What a Vehicle Contains

- **Occupants** — who is aboard, each with a role and an optional title.
- **Gear** — cargo, equipment, and stores carried on the vehicle.
- **Movement** — its travel rates, per medium.
- **Actions** — procedures you attach to the vehicle.
- **Effects** — active effects on the vehicle.

# Capacity and Load

Set **Occupant Capacity** as a number of people and **Carrying Capacity** as a total weight in pounds. These authored figures start at zero until supplied. They are information for the GM, not enforced limits: the system does not refuse occupants or cargo based on either figure.

The occupant count expands Cohorts into their resolved members and counts each person once. Listing a Being directly and through a Cohort does not count them twice. Missing references stay visible in the Occupants list but contribute neither a person nor weight.

**Total Load** combines:

- The body weight and carried gear of each distinct resolved Being aboard
- Gear owned directly by each referenced Cohort
- The vehicle's own cargo, using each gear item's effective weight multiplied by its quantity

Container contents contribute their own weights once, separately from the container's weight. Totals refresh when the referenced actors or their gear change. Missing or unavailable weights contribute zero, so these figures report the weight the system knows about.

**Weight has no effect on speed or any other mechanic.** Exceeding either authored capacity changes no movement rate, action budget, crew requirement, or boarding permission. The GM decides what the figures mean in play.

# Movement

A vehicle carries one **movement profile** per medium it can travel in (land, water, and so on), each a rate. The **star** beside a profile on the **Profile** tab makes that medium the active one, and **Add Movement Profile** adds a rate for a medium it lacks. The rates and the active medium are recorded for you to read.

The system does not move a vehicle. It does not step the token, charge a crew's effort, change speed with the load or the weather, or advance a voyage; you move the token and decide how far a day's travel goes, using the rate on the sheet as your figure. Because the active medium and its rate belong to the vehicle, a barge on a river and the same barge at sea can each carry the rate you choose.

# Crew and Passengers

The **Occupants** tab lists who is aboard. Each row shows the occupant's portrait, name, role (**crew**, **passenger** or **draft creature**), optional title and current health band. An occupant is a reference, not a copy, exactly as a [[doc-cohortug|Cohort]]'s members are: it is named by a shortcode, or by a UUID for a token actor, and an entry may name a whole cohort to stand for all its members. A row whose actor cannot be found stays, named by its raw handle, so you can see and remove it.

Two actions manage the list, and both run only when you invoke them, from the tab's controls, the **Actions** tab or the context menu:

- **Add Occupant** asks for the shortcode or UUID, the role (passenger unless you choose otherwise) and an optional title. It refuses a handle that names no actor you can see, and one already aboard.
- **Remove Occupant** removes the entry after you confirm. The actor itself is untouched.

The role and title are a record of who is doing what. The system does not require a crew, check that a helmsman is aboard, or slow a vehicle that is short-handed; deciding what a vehicle can do with the crew it has is a ruling for the GM. The vehicle also never moves an occupant's token with its own, so when a vehicle moves, you move the occupants' tokens as well.

# Combat and Boarding

A vehicle does not fight and the system does not resolve a boarding. The vehicle has no attack, no health and no protection rating, and the attack procedures require a [[doc-beingug|Being]] as the attacker. Fighting aboard a ship is a fight between the Beings aboard, run with the ordinary combat tools, with [[doc-cmbtntug|combat groups]] to mark who is on which side.

For a boarding, the sheet records the facts you need and the rest is yours to run: add the boarders to the **Occupants** list as **passengers** (or remove defenders who go over the side), and place their tokens where the story puts them. Nothing is transferred or checked when you do, because the list is a record, not a mechanism.

# What a Vehicle Does Not Model

A Vehicle is a container and a conveyance, not a creature:

- **No automatic capacity enforcement.** Passenger capacity, carrying capacity and total load are reported for the GM. They do not prevent additions or change what the vehicle can do.
- **No condition of its own.** A Vehicle has no structural integrity, no hit points, and no damage model. It cannot be worn down, holed, or wrecked by the rules — a ship that catches fire is a matter for narration.
- **No crew effects.** Having a helmsman aboard, or losing one, changes nothing mechanically. The roles are there to record who is doing what, not to modify anything.

# The Vehicle Sheet

The Vehicle sheet has these tabs:

- **Facade** — the public description
- **Profile** — movement rates, the private dossier, and attributes
- **Occupants** — who is aboard, each with a role and an optional title
- **Mysteries** — mysteries and mystical abilities aboard the vehicle
- **Gear** — cargo, equipment, and stores
- **Actions** — available actions
- **Effects** — active effects

**Facade**, **Gear**, **Actions**, and **Effects** are the common actor tabs and behave exactly as they do on a [[doc-beingug|Being]]: the Gear tab is the same inventory ledger (a vehicle's cargo instead of a character's possessions), and the Actions and Effects tabs are identical. They are documented once, in [[doc-undrstndsheetug|Understanding Sheets]] under _Common Actor Tabs_ — see that page for the columns, controls, and how to add, stow, and remove things. The **Mysteries** tab works the same way, listing any Mystery or Mystical Ability item placed on the vehicle; most vehicles carry none. The **Occupants** tab rosters who is aboard, with a role and an optional title, exactly as described above.

The **Profile** tab carries three things, and it is where a vehicle's private notes live:

- **Attributes** — normally empty for a vehicle. The section is kept so a world that wants to give a ship a Quality rating of its own can.
- **Movement** — the travel rate for each medium, with a star marking the active one.
- **Biography** — the **dossier**, the private description only you and the GM see. The public description a player sees stays on **Facade**.

The one difference: a Being's Gear tab reports carried weight and encumbrance, because a character is slowed by what it carries. A vehicle is not encumbered by its cargo, so its Gear tab reports the cargo's total weight alone.

# Intrinsic Actions

A Vehicle defines two actions of its own, which manage its occupants:

| Action          | Shortcode        |
| --------------- | ---------------- |
| Add Occupant    | `addOccupant`    |
| Remove Occupant | `removeOccupant` |

Both are described under _Crew and Passengers_. It also carries the actions every actor shares:

| Action              | Shortcode           |
| ------------------- | ------------------- |
| Edit                | `editDocument`      |
| Delete              | `deleteDocument`    |
| Make Default Medium | `makeDefaultMedium` |

All three belong to every actor and are described on [[doc-baseitemug|Base Item]], which covers what each one does, how it is invoked, and what it produces — the shared document actions are the same wherever they appear.

**Make Default Medium** picks which movement medium a vehicle is currently moving in, and it is driven by the star control in the movement table on the vehicle's own **Profile** tab — click the star beside a medium to make it the active one. **Add Movement Profile**, in that table's header, adds a rate for a medium the vehicle does not yet have.

The cargo and equipment a vehicle carries are ordinary gear items with actions of their own — see [[doc-gearug|Gear]] and the page for each kind of gear.

# See also

- [[doc-ugactors|Actors]] — the four actor kinds and how to choose between them.
- [[doc-structureug|Structure]] — the fixed counterpart, for a place that does not move.
- [[doc-cohortug|Cohort]] — a whole group named as a single occupant.
- [[doc-gearug|Gear]] and [[doc-gearandequipug|Working with Gear and Equipment]] — the cargo a vehicle carries.
- [[doc-undrstndsheetug|Understanding Sheets]] — the tabs a vehicle shares with every other actor.
- [[doc-userguide|User Guide]] — back to the index.
