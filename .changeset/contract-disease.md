---
"sohl": minor
---

**Feature: Contract Disease action for beings (#391)**

Beings gain a `Contract Disease` intrinsic action. It opens a dialog listing
every **disease** (an affliction whose subtype is `disease`) found in the world
and in the installed Item compendium packs, plus a **Custom disease** option for
entering a name and Contagion Index (CI) inline. Only diseases can be contracted.

Contraction is decided by a single d100 **contagion roll** against a target of
`CI × Endurance`. The character rolls to resist; _failing_ the roll contracts the
disease. Because a lower CI yields a lower (easier-to-fail) target, **the lower
the CI, the more contagious the disease**, and higher Endurance protects. On a
failed roll the disease is added to the sheet — the chosen source disease is
copied verbatim, or a fresh `affliction` item is built from the custom name/CI.

The world/compendium search (`fvttFindDiseases`) and the item creation
(`fvttCreateEmbeddedItems`) live at the Foundry boundary in `FoundryHelpers`; the
contagion math and dialog-form parsing are pure, Foundry-free, and unit tested.
