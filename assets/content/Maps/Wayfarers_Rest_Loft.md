---
tags: []
name:
  full: Wayfarer's Rest, Loft
  aliases: []
description: "The sleeping loft above the common room, reached by one stair."
id: UQijWayYHyaZTxlX
shortcode: wayrestloft
type: map
subType: battlemap
sohl:
  kbcat: map
  folder: Pw3nJvVsGuMdRb1K
  place: wayfarersrest
  placeName: Wayfarer's Rest
  image: systems/sohl/assets/ui/parchment.jpg
  dimensions: [512, 512]
  pxPerGrid: 64

  locations:
    sleeping-loft: { at: [3.5, 3.5] }
    stair-head: { at: [6.5, 6.5] }

  walls:
    shell:
      blocks: [movement, sight, light, sound]
      segments:
        - [64, 64, 448, 64]
        - [448, 64, 448, 448]
        - [448, 448, 64, 448]
        - [64, 448, 64, 64]
    stairwell:
      blocks: [movement]
      limits: [sight]
      segments:
        - [352, 352, 352, 448]

  lights:
    lamp:
      position: [256, 128]
      dim: 15
      bright: 5
      color: "#ffd9a0"

  regions:
    sleeping-loft:
      name: Sleeping Loft
      shapes:
        - polygon: [96, 96, 416, 96, 416, 320, 96, 320]
      behaviors:
        rest:
          trigger:
            events: [tokenEnter, tokenExit]
    stair-head:
      name: Stair Head
      shapes:
        - rect: [352, 352, 96, 96]
      behaviors:
        down:
          teleportToken:
            to: { map: wayrestground, region: stair-foot }
---

Half a floor, boarded over the common room's east end and open to it on the
west, so the hearth's warmth rises into the sleeping space and its noise with it.

# Sleeping Loft

Straw mattresses laid side by side under the roof slope. Nobody has a corner of
their own, and nothing left here is left safely.

# Stair Head

The top of the stair, railed on one side. From here the whole common room is
visible to anyone who cares to look down.
