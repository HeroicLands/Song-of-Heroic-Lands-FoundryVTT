---
aliases: []
id: WxM4H3SLZKQhLTog
type: doc
category: user-guide
name:
  full: "Scene Setup and Tokens"
shortcode: scnstpan
folder: IgwaG8rAUUO9vrtz
---

# Overview {#scene-overview}

Scenes in SoHL work like standard Foundry VTT scenes, with some additional features specific to SoHL. This guide covers placing tokens on scenes, Theatre of the Mind mode, and the Cohort expand feature.

See also: [[doc-being|Beings]], [[doc-cohort|Cohorts]]

# Shipped Maps and Adventures {#scene-shipped-maps}

SoHL ships maps in two compendiums, and which one you import from decides whether the map arrives whole.

- **Maps** holds one Scene per map. Drag one onto the Scenes sidebar and you get the canvas, its walls, doors, lights, ambient sounds and regions.
- **Adventures** holds one entry per _place_ — the manor and its floors, the shelter and its loft — bundling those scenes with the journal that describes them.

**Import the Adventure, not the Scene, whenever the map has pins on it.** A map pin points at a page of a journal by its identity, and so does a stairway region that moves a token to the floor above. Importing an Adventure brings every one of those documents in together and keeps their identities, so the pins open the right page and the stairs land in the right place. Dragging the Scene on its own brings the canvas but not the journal, and its pins have nothing to open.

To import: open the **Adventures** compendium, click the entry, review the list of what it contains, and confirm.

Importing the same Adventure again **updates** what is already in your world rather than making a second copy — which is how a corrected map reaches you, and also means your own edits to those scenes and journals are overwritten. If you have changed a shipped map and want to keep the changes, duplicate it first and work on the copy.

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
2. In the TokenHUD (the controls that appear around the token), click the **expand** button (the people icon).
3. The cohort token is replaced by individual tokens for each member, placed in a cluster around the original position.

This is useful when a group encounter transitions into individual combat — start with one cohort token for the approaching band of bandits, then expand them when initiative is rolled.

# See also

- [[doc-token|Token]] — what you can do from a placed token, including starting and answering an opposed test.
- [[doc-cmbtbscs|Combat Basics]] — running the fight the scene is set up for.
- [[doc-cmbtnt|Combatant]] — the combat tracker, its groups, and the combatant row.
- [[doc-cohort|Cohort]] — the group a scene can expand into its members.
- [[doc-being|Being]] — the actor most tokens stand for.
- [[doc-userguide|User Guide]] — back to the index.

<!-- TODO: Document how to collapse individual tokens back into a cohort,
     if that feature exists. Document what happens to cohort-level effects
     when expanded. -->

# Theatre of the Mind {#scene-totm}

Theatre of the Mind (TotM) mode is a per-scene toggle that changes how the scene behaves for narrative, non-tactical play.

## Enabling Theatre of the Mind

1. Open the scene's configuration (right-click the scene tab → Configure).
2. Open the **Sohl** tab and find the **Theatre of the Mind** checkbox.
3. Check it and save.

The setting is per-scene, so a campaign can mix narrative scenes with tactical ones.

## What It Changes

When Theatre of the Mind is enabled, SoHL stops measuring tactical distance on that scene: the distance between any two tokens resolves to zero. In practice that means range and reach never rule an action out — a missile shot or a melee attack is always considered close enough, and the GM narrates whether the distance is plausible.

Nothing else changes: the grid, token movement, vision, and the combat sequence all behave exactly as they do on a tactical scene.

# Token Configuration {#scene-tokens}

<!-- TODO: Document prototype token setup for SoHL actors — recommended
     settings for vision, disposition, display name, bar attributes
     (health, etc.), and how SoHL's primaryTokenAttribute (health) works. -->

# Combat on Scenes {#scene-combat}

When combat begins on a scene, SoHL uses its own initiative and combat tracking system.

See [[doc-cmbtbscs|Combat Basics]] for details on how combat encounters work.

<!-- TODO: Document how to start combat, add combatants, and the relationship
     between tokens and combatants in SoHL's combat system. -->
