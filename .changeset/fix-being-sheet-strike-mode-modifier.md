---
"sohl": patch
---

**`BeingSheet._onRollStrikeModeTest` uses the correct modifier for the chosen test kind**

Previously the method always called `sm.attack` regardless of whether the
player clicked a block or counterstrike cell. It now delegates to a new
pure helper, `selectStrikeModeModifier(sm, testKind)`, which maps:

- `"attack"` → `sm.attack`
- `"block"` → `(sm as MeleeStrikeMode).defense.block`
- `"counterstrike"` → `(sm as MeleeStrikeMode).defense.counterstrike`

An unknown `testKind` returns `undefined` and the roll is silently
skipped. The helper is unit-tested in `being-sheet-view.test.ts`.

Closes #178.
