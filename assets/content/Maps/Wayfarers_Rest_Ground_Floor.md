---
tags: []
name:
  full: Wayfarer's Rest, Ground Floor
  aliases: []
description: "The common room of a roadside shelter: one hearth, one stair, one door."
id: Xwo4dsmey2A3Rvrn
shortcode: wayrestground
type: map
subType: battlemap
sohl:
  kbcat: map
  folder: Pw3nJvVsGuMdRb1K
  # Both floors belong to one place, so they ship in one Adventure and the
  # stair regions can address each other.
  place: wayfarersrest
  placeName: Wayfarer's Rest
  img: systems/sohl/assets/ui/parchment.jpg
  dimensions: [512, 512]
  pxPerGrid: 64

  # GRID squares — a pin centres in its square, hence the halves.
  locations:
    common-room: { at: [4, 4] }
    the-hearth: { at: [1.5, 1.5] }
    stair-foot: { at: [6.5, 6.5] }

  # PIXELS, keyed by feature. `blocks:` is what the wall stops outright and
  # `limits:` what it merely attenuates; anything unnamed is passable.
  walls:
    shell:
      blocks: [movement, sight, light, sound]
      segments:
        - [64, 64, 448, 64]
        - [448, 64, 448, 448]
        - [448, 448, 288, 448]
        - [224, 448, 64, 448]
        - [64, 448, 64, 64]
    stair-rail:
      blocks: [movement]
      limits: [sight]
      segments:
        - [352, 352, 448, 352]

  doors:
    front:
      kind: door
      blocks: [movement, sight, light]
      segment: [288, 448, 224, 448]

  lights:
    hearth:
      position: [112, 112]
      dim: 30
      bright: 10
      color: "#ff9329"

  tiles:
    strongbox:
      position: [352, 96]
      size: [64, 64]
      image: systems/sohl/assets/icons/other/chest.svg

  sounds:
    eaves:
      position: [256, 64]
      radius: 20
      path: systems/sohl/assets/audio/swoosh1.ogg
      volume: 0.3

  regions:
    common-room:
      name: Common Room
      shapes:
        - polygon: [96, 96, 416, 96, 416, 416, 96, 416]
      behaviors:
        arrival:
          trigger:
            events: [tokenEnter]
            action: reactionTest
    smoke-bay:
      name: Smoke Bay
      shapes:
        - rect: [96, 96, 128, 128]
      restrict: light
      behaviors:
        gloom:
          adjustDarknessLevel: { mode: darken, modifier: 0.25 }
    stair-foot:
      name: Stair Foot
      shapes:
        - rect: [352, 352, 96, 96]
      behaviors:
        up:
          teleportToken:
            to: { map: wayrestloft, region: stair-head }
---

A shelter of the commonest kind: a single room with a hearth at one end, a
stair at the other, and a door on the road side. Travellers who cannot reach a
town before dark sleep here and pay nothing for it.

# Common Room

Benches along three walls, a long table that is never moved, and floor rushes
that are changed when someone complains. Strangers arriving after dark are
looked over before they are spoken to.

# The Hearth

Banked rather than lit, most nights. The smoke bay above it is deep enough that
firelight does not carry into the room's corners.

# Stair Foot

A ladder-stair with a rail, rising to the loft. The rail stops a body but not a
line of sight, so whoever is above can see who has just come in.
