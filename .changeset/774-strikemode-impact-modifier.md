---
"sohl": patch
---

**Carry the strike mode's flat impact modifier onto the Being Combat tab**

A weapon strike mode's flat impact bonus (e.g. the Broadsword Cut's `+3`) now
shows on the Being **Combat** tab and feeds the rolled impact, matching what the
weapon item sheet already displayed. Previously the Combat tab rendered the flat
part as `+0` (e.g. `d10+0e` instead of `d10+3e`), and impact rolled from that tab
was understated by the missing bonus.

The flat modifier was being routed only into the impact's inner dice roll, which
the rendered label and the impact roll never read — both derive the flat part
from the `ImpactModifier`'s `ValueModifier` base, which was never seeded. It is
now seeded from `impactBase.modifier` (defaulting to `0` when unset), giving the
flat impact a single home consistent with the modifier model.

Closes #774
