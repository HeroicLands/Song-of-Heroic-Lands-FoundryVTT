---
"sohl": minor
---

Seed body scale on a compressive curve so most creatures sit near human
([#1246](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1246)).

`bodyScaleBase` was seeded linearly from Strength, which spread the bestiary
from 0.18 to 5.45 and put most of that range in the tails. Capping at 3 stopped
the top being unwoundable, but it did so by clipping: the largest dragon, the
elephants, the stone giants and the ice bear all landed on exactly 3.0 and
became indistinguishable, so a bull elephant was precisely as hard to wound as
the largest dragon alive.

The rule is now `((species STR) / 11) ^ 0.65`. Across the 225 creatures re-seeded
it gives a mean of **1.31** with two standard deviations covering roughly 0.3 to
2.3, and a scale of 3 sits at about +3 sd — reached by the largest dragon at
3.01 and by nothing else. Strength 11 still maps to exactly 1.0, so the baseline
is unmoved.

It also un-clips the top, which is the point: where the cap flattened six
creatures onto 3.0, the curve spreads them — 3.01, 2.88, 2.85, 2.68, 2.61 — and
`MAX_BODY_SCALE` stops acting as a clamp at all, the dragon _landing_ on the
ceiling rather than being cut down to it. It stays as a rail for an
Active-Effect enlarge.

The low end barely moves: a wolf goes 0.91 to 0.94, a lion 1.09 to 1.06. The
compression is felt where it should be.

`bodyScaleBase` remains authored rather than computed, so a creature can still
be given a scale out of line with its Strength deliberately; the curve is what
an ordinary one is seeded from. The specification checks every creature against
it, and the Cave and Forest Goblins — previously exempt — now derive theirs like
everything else.
