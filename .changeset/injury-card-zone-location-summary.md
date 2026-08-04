---
"sohl": minor
---

**Injury card: clearer Zone / Location layout and a compact Imp / IL / Shk summary**

Reorganized the top of the Injury chat card. The location block now leads with a
**Zone** row — the Zone-Number + Zone-Die aim trace ending in the zone name
(e.g. `ZN 1 + d6 (5) = ZN 5 → Arms`) — followed by a **Location** row showing the
struck location's _name_. The separate **Body Part** row is removed (it is
inferable from the location), and locations are shown by name rather than
shortcode. Impact, Injury Level, and Shock Index are consolidated into a single
inline summary row reading `Imp: x   IL: x   Shk: x`. All labels, values, and the
Shock Roll button text are localized, including the previously hard-coded
zone-die roll expression (shared with the miss card).

Closes #988
