---
aliases:
  - Hearthmoor
  - regionalmap-hearthmoor
tags: []
name:
  full: Hearthmoor
  aliases: []
description: "The open moor the road crosses, a day's walk end to end."
id: T8lynnfRG7ZcQtq3
shortcode: hearthmoor
type: regionalmap
package: sohl
sohl:
  kbcat: map
  folder: Vh8pLwCzEnUyQ2Sd
  image: systems/sohl/assets/ui/parchment.jpg
  dimensions: [512, 512]
  pxPerGrid: 64

  regions:
    bog:
      name: The Sink
      shapes:
        - polygon: [128, 192, 288, 160, 352, 288, 224, 352]
      behaviors:
        wading:
          modifyMovementCost:
            difficulties: { walk: 3 }
---

Heather and standing water from edge to edge, crossed by one road and no
bridges. A traveller who leaves the road to save distance loses more of it to
the ground than they saved.

# The Sink

The wettest ground on the moor, and the only part of it that looks passable
from the road. Three strides of walking cost what one costs on the metalled way.

# The Road

Raised a little above the heather and drained on both sides, which is the whole
reason it is where it is rather than where a straight line would put it.
