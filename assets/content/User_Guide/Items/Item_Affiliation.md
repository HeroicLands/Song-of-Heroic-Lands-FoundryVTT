---
aliases:
    - Affiliation
id: hJGjCXud883VX96W
type: doc
package: sohl
category: user-guide
name:
    full: "Affiliation"
slug: "item-affiliation"
folder: QtOgPodi8X6gDWL0
---

# What Is an Affiliation?

An Affiliation represents a character's membership and standing in an organized body within the game world — a group, faction, order, or institution the character belongs to. It records not merely _that_ a character belongs, but _how far up_ they stand: their rank, role, and title within that body.

Think of an Affiliation as a **credential**. It states who a character answers to and what standing they hold; it is not, by itself, a list of powers or skills. A priest's affiliation says they are a rank-3 priest of their church — the invocations they can call on are recorded separately as [[Item_Mystery|Mysteries]] and [[Item_MysticalAbility|Mystical Abilities]].

# Where It Appears

Affiliations appear on the **Profile** tab of Beings, listed in a table with **Rank / Society / Office / Title / Notes** columns. A **+ Add** control creates a new one, and a character may hold several affiliations at once.

# Why Use an Affiliation?

Use an Affiliation whenever a character's relationship to an organization matters to play:

- To record **social standing and connections** — who the character answers to, who owes or is owed loyalty, and the doors their membership opens.
- To capture **rank within a hierarchy** — the single most useful thing an Affiliation tracks. A layperson and a senior member of the same body are treated very differently, and the **Level** field is where that difference lives.
- To give institutional standing a **single, canonical home**, rather than scattering it across other items.

# When to Use One

Reach for an Affiliation for any organized body the character belongs to. Common cases:

- **Religion** — membership in a faith, with **Level** as the rank in its hierarchy. Rank 0 is usually a lay member; rank 1 an initiate, acolyte, or novice; a fully ordained, accepted member (a "priest") is usually around rank 3, with higher ranks for greater offices.
- **Arcane school** — membership in a school or convocation of magic, with **Level** as the grade within it, from student through master.
- **Faction membership** — the political, courtly, or interest-group factions a character has thrown in with.
- **Criminal organizations** — thieves' guilds, smuggling rings, or other outlaw bodies, with **Level** marking the character's place in the pecking order.
- **Guilds, noble houses, and military units** — a trade guild, a house the character is sworn to, or a rank in a fighting company.

> **Recording religious and arcane rank.** The **Level** field is the home for a character's rank in a religion or grade in an arcane school — it keeps "what the character _is_ within an order" together with the rest of their membership. This standing is a **capability credential** the rest of the sheet can draw on: a religious or arcane [[Item_Skill|Skill]] can scale with it by referencing the affiliation's rank as `affiliation.<code>.level` in its **Skill Base Formula** (using the affiliation's shortcode), and a [[Item_MysticalAbility|Mystical Ability]] tied to this affiliation can take the rank into account. The affiliation only _informs_ such derivations — invoking a power is always the player's deliberate act, never something the system does on its own.

# Additional Properties

Along with the [[Item_Base|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **Society:** The sub-group, sect, order, or convocation the character belongs to within the larger organization.
- **Office:** The role or function the character fills within the organization, if any — for example a stewardship, a command, or a ministry.
- **Title:** The title of the character's rank within the organization — the named form of their standing, sometimes influenced by their Office.
- **Level:** The character's rank within the organization, as a number, with higher numbers indicating greater rank. Rank 0 is usually a lay member; rank 1 an initiate, acolyte, or apprentice; in most organizations a fully trained and accepted member — such as a guild master or an ordained priest — is around rank 3.
