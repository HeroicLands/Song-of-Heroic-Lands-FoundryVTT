---
title: "Scene Setup and Tokens"
slug: "scene-setup"
category: "User Guide"
sort: 13
tags:
    - ui
    - scenes
    - tokens
    - theatre of the mind
    - cohort
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# Overview {#scene-overview}

Scenes in SoHL work like standard Foundry VTT scenes, with some additional
features specific to SoHL. This guide covers placing tokens on scenes,
Theatre of the Mind mode, and the Cohort expand feature.

See also: [Beings](user-guide/actor-being.md), [Cohorts](user-guide/actor-cohort.md), [Assemblies](user-guide/assemblies.md)

# Placing Actors on Scenes {#scene-placing}

To place an actor on a scene:

1. Open the scene you want to populate.
2. Drag an actor from the **Actors** sidebar tab onto the canvas.
3. A token appears representing the actor's physical presence.

You can also drag actors directly from compendiums onto the canvas.

## Beings

When you drag a Being onto the scene, a single token appears. The token
uses the Being's prototype token settings (image, size, vision).

## Cohorts

When you drag a Cohort onto the scene, SoHL asks whether you want to place
the cohort as a **single token** (representing the group) or **expand it**
into individual member tokens placed around the drop point.

## Assemblies

When you drag an Assembly onto the scene, a token appears representing the
Assembly's canonical item. This is useful for interactive objects like
treasure chests, magical artifacts, or other items that exist physically
in the game world.

# The Cohort Expand Feature {#scene-cohort-expand}

Cohorts have a special TokenHUD button that lets you expand a group token
into individual member tokens.

## Expanding a Cohort

1. Select a Cohort token on the canvas.
2. In the TokenHUD (the controls that appear around the token), click the
   **expand** button (the people icon).
3. The cohort token is replaced by individual tokens for each member,
   placed in a cluster around the original position.

This is useful when a group encounter transitions into individual combat —
start with one cohort token for the approaching band of bandits, then expand
them when initiative is rolled.

<!-- TODO: Document how to collapse individual tokens back into a cohort,
     if that feature exists. Document what happens to cohort-level effects
     when expanded. -->

# Theatre of the Mind {#scene-totm}

Theatre of the Mind (TotM) mode is a per-scene toggle that changes how the
scene behaves for narrative, non-tactical play.

## Enabling Theatre of the Mind

1. Open the scene's configuration (right-click the scene tab → Configure).
2. Find the **Theatre of the Mind** checkbox in the scene settings.
3. Check it and save.

## What It Changes

When Theatre of the Mind is enabled:

<!-- TODO: Document exactly what TotM mode changes — does it hide the grid?
     Disable token movement restrictions? Change how combat works? List all
     mechanical effects of this toggle. -->

# Token Configuration {#scene-tokens}

<!-- TODO: Document prototype token setup for SoHL actors — recommended
     settings for vision, disposition, display name, bar attributes
     (health, etc.), and how SoHL's primaryTokenAttribute (health) works. -->

# Combat on Scenes {#scene-combat}

When combat begins on a scene, SoHL uses its own initiative and combat
tracking system.

See [Combat Basics](user-guide/combat-basics.md) for details on how combat
encounters work.

<!-- TODO: Document how to start combat, add combatants, and the relationship
     between tokens and combatants in SoHL's combat system. -->
