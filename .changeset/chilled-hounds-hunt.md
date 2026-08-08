---
"sohl": patch
---

**Reclassify the phobia compendium items as Fear traumas (#1229)**

All 78 phobia items shipped as Trauma `subType: psycond` with `category: impulse` —
a value from the `quirk`/`impulse`/`disorder` scale, which is the wrong scale for a
phobia. They are now `subType: fear`, shipping in the baseline `category: none` state
with `levelBase: 0`, so a phobia can express the fear states that actually drive its
behavior (`none` / `brave` / `steady` / `afraid` / `terrified` / `catatonic`).

**Folder tree**

The items compendium gains a **Fear** folder under **Trauma**, and the existing
**Phobias** folder now sits beneath it rather than under **Psychological**:

| before                           | after                       |
| -------------------------------- | --------------------------- |
| Trauma → Psychological → Phobias | Trauma → **Fear** → Phobias |

_Acrophobia_ was additionally filed under **Quirks** rather than **Phobias**; it now
sits with the other 77.

**Upgrading**

Existing worlds are unaffected — phobia items already dragged onto an actor keep
whatever subtype and category they were created with. The reclassification applies to
the compendium content, so re-import a phobia to pick up the new values.
