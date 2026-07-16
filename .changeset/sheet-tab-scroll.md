---
"sohl": patch
---

**Make sheet content tabs scroll instead of clipping (#514)**

Long content tabs (the Being sheet's Skills, Combat, Trauma, Gear, and the
overflowing tabs of other sheets) were clipped with no scrollbar. The base
`.window-content .tab` rule set `overflow-y: hidden`, and the Being-specific
override that was meant to fix it (`.being .window-content .tab`) was dead CSS —
loaded under `.sohl.sheet` it compiled to `.sohl.sheet .being …`, which never
matches because `sohl`, `sheet`, and `being` share one sheet-root element.

The base rule now uses `overflow-y: auto`, so every SoHL sheet's tabs gain a
scrollbar when their content exceeds the sheet height. `window-content` is a
flex column with a definite height (a Foundry ApplicationV2 default), so the
`height: 100%` tab is already bounded and needs nothing more. Paired with the
`scrollable: [""]` part config that preserves scroll position across re-renders.
