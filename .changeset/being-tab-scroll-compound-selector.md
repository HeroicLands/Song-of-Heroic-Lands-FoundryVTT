---
"sohl": patch
---

**Make the Being sheet's content tabs actually scroll (#514)**

The scroll fix added for #514 was dead CSS. It was authored as
`.being .window-content .tab { overflow-y: auto }` in `layout/_sheet.scss`, which
is loaded under the compound `.sohl.sheet` wrapper — so it compiled to
`.sohl.sheet .being …`. ApplicationV2 places `sohl`, `sheet`, and the `being`
type class on the **same** sheet-root element, so that descendant selector never
matched and the tabs kept the base `overflow-y: hidden`: long tabs (skills, body
locations, injuries, gear) clipped their overflow with no scrollbar.

The rule now lives in `components/_being.scss` under the **compound**
`.sohl.being` selector (which matches, and sits in the `components` layer so it
wins over the base `.tab` rule). `min-height: 0` lets the flex-child tab shrink
below its content so the scrollbar appears. The `scrollable: [""]` part config
(already in place) preserves the scroll position across submit-on-change
re-renders.
