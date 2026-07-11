---
"sohl": minor
---

**Overloaded `SohlEntity` constructor: `new X(parent)` shorthand**

`SohlEntity` and the entity subclasses that construct usefully from an empty data
bag now accept a `(parent)` shorthand alongside the existing `(data, options)`
form — mirroring the `clone(parent)` shorthand:

```ts
new ValueModifier(logic); // was: new ValueModifier({}, { parent: logic })
```

The base gains two `protected static` normalizers (`SohlEntity.dataOf` /
`SohlEntity.optionsOf`) and a `SohlEntity.DataOrParent<D>` type alias. The
overload is resolved by the `isA(x, "SohlLogic")` **brand** check (not
duck-typing), so a data bag that merely carries a `parent` key is never mistaken
for a Logic. The runtime throw and its exact message (`SohlEntity requires a
parent`) are unchanged.

Adopted by `ValueModifier`, `MasteryLevelModifier`, `CombatModifier`,
`ImpactModifier`, `SimpleRoll`, `TestResult`, and `SuccessTestResult`. Classes
that require non-empty data (the body classes, strike modes, and the non-empty
results) keep their single `(data, options)` constructor. Also fixes a latent
throw in `AttackResult` where `new ImpactModifier()` was called with no
arguments — the zero-argument form no longer compiles.

**Compatibility note.** A downstream module subclass that declares a bare
two-required-parameter `constructor(data, options)` will no longer satisfy
`typeof ValueModifier` for `sohl.entity.register` — an overloaded target requires
the source to satisfy every overload. Subclasses that declare _no_ constructor
(the common case) inherit the overloads and are unaffected. Runtime behavior is
unchanged either way.

Closes #369
