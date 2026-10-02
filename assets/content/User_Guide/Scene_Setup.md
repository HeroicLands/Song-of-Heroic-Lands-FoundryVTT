---
shortcode: scnsetuptokug
name: {full: "Scene Setup and Tokens"}
type: doc
subType: userguide
data: {packFolder: userguide}
---

# Overview {#scene-overview}

Scenes in SoHL work like standard Foundry VTT scenes, with some additional features specific to SoHL. This guide covers placing tokens on scenes, Theatre of the Mind mode, and the Cohort expand feature.

See also: [[doc-beingug|Beings]], [[doc-cohortug|Cohorts]]

# Shipped Maps and Adventures {#scene-shipped-maps}

SoHL ships maps in two compendiums, and which one you import from decides whether the map arrives whole.

- **Maps** holds one Scene per map. Drag one onto the Scenes sidebar and you get the canvas, its walls, doors, lights, ambient sounds and regions.
- **Adventures** holds one entry per _place_ — the manor and its floors, the shelter and its loft — bundling those scenes with the journal that describes them.

**Import the Adventure, not the Scene, whenever the map has pins on it.** A map pin points at a page of a journal by its identity, and so does a stairway region that moves a token to the floor above. Importing an Adventure brings every one of those documents in together and keeps their identities, so the pins open the right page and the stairs land in the right place. Dragging the Scene on its own brings the canvas but not the journal, and its pins have nothing to open.

To import: open the **Adventures** compendium, click the entry, review the list of what it contains, and confirm.

Importing the same Adventure a second time **updates** what is already in your world rather than making a second copy — which is how a corrected map reaches you, and also means your own edits to those scenes and journals are overwritten. If you have changed a shipped map and want to keep the changes, duplicate it first and work on the copy.

A map you import is an ordinary Foundry scene afterwards. Nothing about it is locked: move a wall, add a light, repaint the regions.

## Regions on a shipped map

Some maps carry **regions** — a marked area of the canvas that reacts when a token enters or leaves it. Where a region has a **SoHL Event Trigger** on it, entering can _offer_ the token's owner an action: a chat card with a **Perform** button, exactly like every other offer the system makes. Nothing is rolled and nothing happens to the character until that button is clicked, and only its owner can click it.

You can see and edit these from the Regions layer, and remove one you do not want.

# Placing Actors on Scenes {#scene-placing}

To place an actor on a scene:

1. Open the scene you want to populate.
2. Drag an actor from the **Actors** sidebar tab onto the canvas.
3. A token appears representing the actor's physical presence.

You can also drag actors directly from compendiums onto the canvas.

## Beings

When you drag a Being onto the scene, a single token appears. The token uses the Being's prototype token settings (image, size, vision).

## Cohorts

When you drag a Cohort onto the scene, SoHL asks whether you want to place the cohort as a **single token** (representing the group) or **expand it** into individual member tokens placed around the drop point.

# The Cohort Expand Feature {#scene-cohort-expand}

Cohorts have a special TokenHUD button that lets you expand a group token into individual member tokens.

## Expanding a Cohort

1. Select a Cohort token on the canvas.
2. In the TokenHUD (the controls that appear around the token), click **Expand to Individual Tokens** (the people icon).
3. The cohort's own token is deleted, and a token for each member is created in a cluster around the position it occupied.

This is useful when a group encounter transitions into individual combat — start with one cohort token for the approaching band of bandits, then expand them when initiative is rolled.

**Expanding runs one way.** It deletes the cohort's token rather than hiding it, and there is no action that gathers the member tokens back into one. To return to a single cohort token, delete the member tokens from the scene and drag the Cohort actor onto it as a fresh placement — the same **single token** or **expand** choice described under [[#scene-placing|Placing Actors on Scenes]] applies.

Expanding touches only the token, never the Cohort actor's own record: its sheet, its members list, and anything on it are untouched by either direction of the move. An effect applied directly to the cohort's token stops being represented on the canvas once that token is gone — it is not carried onto any member's token, and a member's own effects are unaffected by the cohort's.

# Theatre of the Mind {#scene-totm}

Theatre of the Mind (TotM) mode is a per-scene toggle that changes how the scene behaves for narrative, non-tactical play.

## Enabling Theatre of the Mind

1. Open the scene's configuration (right-click the scene tab > Configure).
2. Open the **Sohl** tab and find the **Theatre of the Mind** checkbox.
3. Check it and save.

The setting is per-scene, so a campaign can mix narrative scenes with tactical ones.

## What It Changes

When Theatre of the Mind is enabled, SoHL stops measuring tactical distance on that scene: the distance between any two tokens resolves to zero. In practice that means range and reach never rule an action out — a missile shot or a melee attack is always considered close enough, and the GM narrates whether the distance is plausible.

Nothing else changes: the grid, token movement, vision, and the combat sequence all behave exactly as they do on a tactical scene.

# Token Configuration {#scene-tokens}

A token's size, art, vision, disposition, and displayed name are Foundry's own
settings, configured on the actor's **prototype token** and inherited by every
token you place from it. Set them once on the actor rather than on each placed
copy.

One setting is SoHL's: the system names **health** as the token's primary bar
attribute, so a bar bound to it shows the actor's health assessment on a 0–100
scale. That value is recomputed from the actor's impaired body parts every time
the actor is prepared, and it is not stored — typing a number into the bar
changes nothing. Treat the bar as a readout of the assessment described under
[[doc-beingug|Being]], not as a pool to spend down.

# Combat on Scenes {#scene-combat}

## Starting Combat

Open the **Combat Tracker** tab in the sidebar and click **Create Combat**, or select a token on the canvas and click its **combat** control in the TokenHUD — that both creates the encounter (if none is active for the scene) and adds the selected token to it in one step.

## Adding Combatants

Add further tokens the same way: select one or more and click their TokenHUD combat control, or drag a token onto the Combat Tracker. Each token you add becomes its own row in the tracker.

A combatant joins a **combat group** the moment it is added — SoHL reads the token's actor's **Default Combat Group** (set on the Combat tab of the character sheet, GM-only) and assigns the combatant to a group of that name, creating the group if it does not already exist; an actor with nothing set joins **Opponents**. See [[doc-cmbtntug|Combatant]] for what a group decides and how to move a combatant to a different one.

## Token and Combatant

A **combatant** is the encounter's own record of a token, not something stored on the actor: it exists only while that encounter runs, and the same actor is a fresh combatant the next time it joins a fight. The two stay linked while both exist — deleting a token that is in combat deletes its combatant with it, permanently. Removing a combatant from the tracker without deleting its token simply takes that token out of the fight; the token stays on the canvas.

See [[doc-tokenug|Token]] for what you can do from a placed token, and [[doc-cmbtbscsug|Combat Basics]] for how the fight itself plays out once the tracker is running.

# See also

- [[doc-tokenug|Token]] — what you can do from a placed token, including starting and answering an opposed test.
- [[doc-cmbtbscsug|Combat Basics]] — running the fight the scene is set up for.
- [[doc-cmbtntug|Combatant]] — the combat tracker, its groups, and the combatant row.
- [[doc-cohortug|Cohort]] — the group a scene can expand into its members.
- [[doc-beingug|Being]] — the actor most tokens stand for.
- [[doc-userguide|User Guide]] — back to the index.
