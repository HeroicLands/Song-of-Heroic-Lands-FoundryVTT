---
"sohl": minor
---

**Body structure: a Zone tier, stored as three flat arrays** (#780)

`system.body.structure` now holds three sibling arrays — `zones`, `parts`, and
`locations` — where each child names its parent by shortcode (`bodyZoneCode` /
`bodyPartCode`). `BodyStructure` assembles them into the Zone → Part → Location
hierarchy on every prepare. Body parts no longer nest their locations, and the
`adjacent` part-graph is gone.

**Body zones.** A zone is the broadest anatomical division (Head / Arms / Torso /
Legs for a humanoid) and the first stage of hit determination. Each zone claims a
contiguous run of _zone numbers_ sized by its `probWeight`, allocated in
persisted order — a body weighing 1 / 4 / 4 / 6 covers 1, 2–5, 6–9, 10–15. An
unaimed strike rolls once against the total to pick the zone, then draws a
weighted part inside it and a weighted location inside that. Zones are
first-class on the Combat tab: the Body Locations tree renders Zone → Part →
Location again, with add / edit / delete / drag-sort at every tier and a new
`BodyZoneConfig` editor.

**Aimed-strike drift no longer needs a hand-authored graph.** A scattering blow
drifts to the target part's zone siblings first, then widens outward one zone at
a time. Creature authors no longer maintain pairwise adjacency: the 240 shipped
creature and character bodies drop it, and the zone weights preserve the previous
unaimed hit distribution.

**Update helpers are symmetric and cascade.** Every tier has
`add*Update` / `remove*Update` / `move*Update` / `set*FieldsUpdate`, each a
complete-array write (#247). Deleting a zone removes its parts and their
locations; deleting a part removes its locations. Renaming a zone or part
re-points its children via `repointPartsUpdate` / `repointLocationsUpdate`.
`movePartUpdate` and `moveLocationUpdate` now take a destination parent shortcode
and a position within it, so a part can be re-parented between zones and a
location between parts.

_Breaking:_ `BodyStructure.adjacent`, `getAdjacentParts`, `hasEdge`,
`addEdgeUpdate`, and `removeEdgeUpdate` are removed — use
`getNeighborParts` and the zone tree. `BodyPart.Data.locations` and
`BodyPart.Options.structure` are replaced by `bodyZoneCode` / `zone`; a part's
locations are supplied by the structure. Hit-location shortcodes must now be
unique body-wide rather than only within their part.
