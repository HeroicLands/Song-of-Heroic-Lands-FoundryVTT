---
"sohl": patch
---

**Make the Being sheet's compact list-row styling actually apply (#515)**

The compact-row rules added for #515 were authored as `.being { … }` inside
`components/_items.scss`, which is loaded under the `.sohl { }` wrapper, so they
compiled to the _descendant_ selector `.sohl .being …`. ApplicationV2 places
`sohl` and the `being` sheet-type class on the **same** sheet-root element, so
that descendant selector never matched and the rules were dead CSS — Being list
names still rendered as oversized Cinzel headings (multi-word trauma names
wrapped to three lines).

The styling now lives in its own `components/_being.scss`, loaded from `sohl.scss`
under the **compound** `.sohl.being` selector (the same same-element trap the
sheet frame avoids via `.sohl.sheet`). Column widths are keyed on `.list__items`
so the header row and the data rows share them and their columns line up.
