---
aliases:
  - Cohort
id: 3uAE5ivwuwl1a1ir
type: doc
subType: user-guide
name:
  full: "Cohort"
shortcode: cohortug
folder: sYK1BozT9xFcinXK
---

# What Is a Cohort?

A Cohort is a **named body of individuals** — a squad of soldiers, a band of followers, a ship's crew, a household. It does not replace those individuals: each member remains their own [[doc-beingug|Being]], with their own sheet, skills, and wounds. What the Cohort adds is the **fact of the group** — who belongs to it, who leads it, and what its members have pooled — recorded in one place so you do not have to hold it in your head.

**Its unique capability is the roster.** A Cohort is the only actor that maintains a membership list of _other actors_ and reads their state back to you. Open it and you see, at a glance, who is in the group, what part each of them plays in it, who is in charge, and — since each member's health is listed beside their name — how the group as a whole is faring. That last point is the practical reason to keep one: after a hard fight you can see which of your twelve guardsmen need a healer without opening twelve sheets.

Alongside the roster it pools **shared gear**: equipment that individual members have marked as shared with the group, gathered into one list that names who is actually carrying each item. The group is a ledger of its members' property, not an owner of it — the gear stays on the member who carries it.

# When to Use a Cohort

Use a Cohort when a set of characters has an identity as a group that outlives any one scene:

- A standing body — a patrol, a warband, a ship's crew, a temple's staff
- A group you want to be able to look at as a whole: its membership, its leader, its condition
- A group whose members lend each other equipment and need one place to see it

**A Cohort is not a way to avoid making characters.** Its members are real actors, and it works by pointing at them. If you want a mob you never have to detail, a single Being standing in for the whole is the simpler tool.

**A Cohort is also not a combat side.** Who fights whom in an encounter is decided by [[doc-cmbtntug|combat groups]], not by cohort membership; a cohort's members can end up on opposite sides of a brawl. See _Combat groups_ on the [[doc-cmbtntug|Combatant]] page.

# What a Cohort Contains

- **Members** — the individuals that make up the group, each named, given a role, and shown with their current health. One of them may be marked as leader.
- **Shared Gear** — a read-only view of what members have shared with the group, naming the member who carries each item.
- **Actions** — procedures you attach to the group itself.
- **Effects** — active effects on the group.

# What a Cohort Does Not Model

A Cohort has **no characteristics of its own**. It has no group attributes, no group skills, no group health, and it makes no rolls. It is not a creature and cannot be attacked, injured, or placed on the map as a combatant — everything that happens in play happens to its **members**, individually.

So a Cohort never acts as one. If you want ten soldiers to attack together, ten attacks are made; the Cohort simply tells you which ten soldiers those are.

# The Cohort Sheet

The Cohort sheet has these tabs:

- **Facade** — group portrait and description
- **Profile** — the private dossier, movement rates, and attributes
- **Members** — the individuals that belong to this cohort
- **Shared Gear** — what the members have shared with the group
- **Actions** — available group actions
- **Effects** — active effects on the group

**Facade**, **Profile**, **Actions**, and **Effects** are the common actor tabs and behave exactly as they do on a [[doc-beingug|Being]]; they are documented once, in [[doc-undrstndsheetug|Understanding Sheets]] under _Common Actor Tabs_. The **Members** and **Shared Gear** tabs are particular to a Cohort.

The **Profile** tab carries three things, and it is where a cohort's private notes live:

- **Attributes** — normally empty for a cohort. The section is kept so a world that wants to give a warband a rating a rating of its own can.
- **Movement** — the travel rate for each medium, with a star marking the active one.
- **Biography** — the **dossier**, the private description only you and the GM see. The public description a player sees stays on **Facade**.

# The Members Tab

**Members** is the cohort's roster: who belongs to this group, what part each plays in it, and which of them leads it. Each row shows the member's portrait, name, and role.

## How a Member Is Named

A member is a reference to an actor — never a copy of one. The reference is a single **handle**, and it comes in two forms because cohort members do:

- **A shortcode** — for an ordinary actor in your world or a compendium. This is the handle to use for named characters: `aldric`, `sergeant-vell`.
- **A UUID** — for a **token actor**: one of a band of orcs who are each their own unlinked token off a single shared orc actor. No shortcode can tell those apart, because they all share one, so the cohort names them by UUID instead (`Scene.abc.Token.def.Actor.ghi`).

Whichever form a member carries, its row shows the actor's real name. If the actor cannot be found — it was deleted, it lives in a compendium you have not loaded, or you lack permission to see it — the row stays, greyed, showing the raw handle instead. Nothing is silently dropped from the roster; you can always see what is missing, and remove it.

## Adding a Member

Click **+ Add Member** in the tab's header. The dialog asks for the shortcode or UUID and the member's role. The handle is checked before anything is written: it must name an **actor** you can see, and one that is not already a member. Anything else is refused, with a message saying why.

## Toggling the Leader

Each row carries a **chess-king** icon. Click it to make that member the leader — the king lights up on their row, and dims on whoever led before. Click the lit king on the leader's own row to stand them down; the cohort then has no leader. A cohort is never obliged to have one.

The leader is always one of the members. Removing the member who leads the cohort leaves it leaderless, rather than leaving a name behind that no longer belongs to anyone.

## Removing a Member

The **trashcan** on a row removes that member from the cohort, after asking you to confirm. Only the membership is removed: the actor, and everything on it, is untouched — a member who leaves the group is still very much a character.

## What the Roster Feeds

The roster is what the rest of the cohort reads:

- **Expanding onto a scene.** Dropping a cohort and choosing _Individual Tokens_ (or using the token's expand button) places one token per member, resolved through these same handles. See [[doc-scnsetuptokug|Scene Setup]].
- **Shared Gear.** The gear listed on the next tab is gathered from these members — see below.

# The Shared Gear Tab

**Shared Gear** answers one question: what does this group collectively have to hand? It lists every piece of gear the cohort's members carry _and have marked as shared with this cohort_ — the party's rope, lantern, tent, and rations, gathered into one view no matter whose pack they are actually in.

It shows the same columns as an ordinary [[doc-gearug|Gear]] tab — item, type, quantity, weight, quality, durability, notes — plus one more: **Carried By**, the member whose sheet the item actually lives on.

## It Is a View, Not a Store

A cohort owns nothing. Nothing on this tab is a copy, and nothing has moved:

- **The item stays on its carrier.** Sharing a coil of rope does not take it out of Aldric's pack; it only makes the group aware he has it. The weight still counts against Aldric's encumbrance, and only Aldric can use it.
- **The tab is read-only.** There is nothing to drag, nothing to drop, no container to reassign, no carried or worn toggle, and no way to create or delete an item from here. To change an item, open it on the character that carries it.
- **No combined weight is shown.** A total across half a dozen different packs is nobody's load, so the tab does not pretend to compute one. Each carrier's own Gear tab still reports their encumbrance.

If a member leaves the cohort — or the item is deleted, or you cannot see the member's actor — the item simply stops appearing here. Nothing is orphaned.

## Sharing an Item With the Cohort

Sharing is set on the **item**, on the character that carries it: open the gear item's **Properties** tab and pick the cohort (or cohorts) in **Shared With**. See [[doc-gearug|Gear]] for the control. Because sharing lives on the item, the carrier's player is always the one who decides what the group gets to see — the cohort can never reach out and claim something.

<!-- TODO: Expand with details on how cohort-level skills/attributes interact
     with individual member capabilities, and how cohort combat works -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->

# Intrinsic Actions

A Cohort defines three actions of its own — the ones that manage its roster:

| Action        | Shortcode      |
| ------------- | -------------- |
| Add Member    | `addMember`    |
| Remove Member | `removeMember` |
| Toggle Leader | `toggleLeader` |

These are the same actions the Members tab's controls run, so it makes no difference whether you click the **+ Add Member** button, the trashcan, or the chess-king on a row, or pick the action from the **Actions** tab or the sheet's context menu — the behavior, and the questions you are asked, are identical. Run from the Actions tab, **Remove Member** and **Toggle Leader** first ask _which_ member, since no row was clicked to say so.

None of them ever acts on its own: each is invoked by you, and each writes only the cohort's own roster. Adding a member does not touch that member's actor, and removing one does not delete anything.

It also carries the actions every actor shares:

| Action              | Shortcode           |
| ------------------- | ------------------- |
| Edit                | `editDocument`      |
| Delete              | `deleteDocument`    |
| Make Default Medium | `makeDefaultMedium` |

All three belong to every actor and are described on [[doc-baseitemug|Base Item]], which covers what each one does, how it is invoked, and what it produces — the shared document actions are the same wherever they appear.

**Make Default Medium** picks which movement medium an actor is currently moving in, driven by the star control in the movement table on the cohort's own **Profile** tab. A cohort does not move as a body — its members each move themselves — so in practice it stays on the _None_ row; the control is there because movement is a capability every actor carries.

The Beings listed on the **Members** tab keep their own actions on their own sheets; running an action on the cohort never rolls for a member, and running one on a member never speaks for the group.

# See also

- [[doc-ugactors|Actors]] — the four actor kinds and how to choose between them.
- [[doc-beingug|Being]] — the actor each member of a cohort is.
- [[doc-scnsetuptokug|Scene Setup and Tokens]] — placing a cohort on a scene and expanding it into its members.
- [[doc-gearug|Gear]] and [[doc-gearandequipug|Working with Gear and Equipment]] — the items the Shared Gear tab is a view onto.
- [[doc-undrstndsheetug|Understanding Sheets]] — the tabs a cohort shares with every other actor.
- [[doc-userguide|User Guide]] — back to the index.
