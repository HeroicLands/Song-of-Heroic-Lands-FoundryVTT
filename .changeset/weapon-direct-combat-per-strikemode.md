---
"sohl": patch
---

**Weapon direct combat is per-strike-mode assisted combat, not weapon-level actions**

Resolves #69. Assisted combat — rolling attack / block / counterstrike with the
weapon's modifiers applied, no workflow — is provided by the per-strike-mode
Atk/Blk/CX cells on the Combat tab (they run `successTest`). The weapon-level
`attack` / `block` / `counterstrike` intrinsic actions on `WeaponGearLogic` were
unimplemented stubs (hidden, `visible: false`, warning "not yet implemented"),
so they are removed rather than implemented — there is no separate weapon-level
combat action. Also drops their now-unused localization keys and the stale RED
e2e markers.
