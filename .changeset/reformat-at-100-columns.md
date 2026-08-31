---
"sohl": patch
---

Reformat at 100 columns.

`@heroiclands/package-build` 9.0.0 raises the shared `printWidth` from 80 to
100, and this repository is where the evidence for that came from: at 80,
Prettier could not honour the limit on **1,399 lines** of this source — long
string literals, `@src/…` specifiers, generic signatures — so those lines ran
over anyway _and_ their surroundings were broken up to no purpose. At 100 that
falls to 75.

The measured effect here matches: **590 files, 10,344 lines shorter**.

Nothing about the system changes. No emitted document, no manifest, no stored
data, no behaviour — `tsc --noEmit` is clean, `lint:schema` still agrees with
the source, and all 4,867 tests pass. This reaches users not at all; it is
hygiene, and it is in this release only because a formatting change is cheapest
when it rides along with a version bump that was happening anyway.

**Bump**

_Patch._ Whitespace.
