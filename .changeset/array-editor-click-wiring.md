---
"sohl": patch
---

**Item-sheet array editors persist on a real click**

Fix the shared array-editor **Add** / **Delete** controls (`.add-array-item` /
`.delete-array-item`) on item sheets, which rendered but did not persist when
clicked — a genuine click never reached the handler even though invoking it
directly worked. This affected every list built on the shared editor (the
Attribute sheet's **Impaired By Roles** and **Value Descriptors**, the Armor Gear
sheet's coverage locations, and the Mystery sheet's affected skills).

The controls were bound with per-node `addEventListener` in the sheet's
`_onRender`; those nodes were detached by a later part re-render, so the SoHL
listener was no longer on the live control when clicked. They are now wired
through ApplicationV2's delegated `data-action` mechanism (the same pattern the
other item-sheet controls use), which dispatches from a single listener on the
frame that survives every part re-render.

Closes #734
