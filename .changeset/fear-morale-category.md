---
"sohl": minor
---

**Fear/Morale state now lives in the Trauma `category` field**

Fear (#558) and Morale (#559) trauma state is now tracked in the Trauma
`category` string field — the same mechanism Fatigue, Psychological Condition, and
Physical Condition already use — instead of the numeric `levelBase`. The
`FEAR_CATEGORY` / `MORALE_CATEGORY` enums are now string-valued (`none`, `brave`,
`steady`, …), and severity ordering (most-severe-wins, worsen-only transitions,
the `>=` state gates) is preserved via each enum's declaration order.

On the Trauma item sheet, Fear and Morale now show the per-subtype **Category**
dropdown rather than a numeric level field, and the Being sheet's trauma ledger
renders the named state (Afraid, Routed, …) from `category`.

Closes #961
