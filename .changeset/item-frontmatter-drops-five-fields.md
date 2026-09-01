---
"sohl": minor
---

Retire five item-frontmatter fields that never reached a saved document.

Adopting `@heroiclands/package-build` 9.0.0 crosses its 8.0.0, which stopped
emitting five `system` fields no SoHL DataModel declares. Foundry discarded every
one of them at construction, on every compiled document, silently:

| type             | retired field                                            |
| ---------------- | -------------------------------------------------------- |
| `affliction`     | `isTreated`                                              |
| `trauma`         | `isTreated`, `isBleeding`                                |
| `projectilegear` | `impactBase.overrideDice`, `impactBase.overrideModifier` |

**Two were never storable.** `isTreated` and `isBleeding` are _derived_ on the
logic classes — `AfflictionLogic.isTreated` is `treatmentDate != null`, and
`TraumaLogic.isBleeding` is `bloodLossAdvanceDurationBase != null`. Nothing
replaces them: an untreated affliction is one whose `treatmentDate` is unset,
which is already its initial value.

**The projectile overrides are removed rather than added to the DataModels**,
because nothing wants them: no DataModel declares them, no logic class reads
them, no localization key names them. A launcher-versus-ammunition override may
be worth having, but it would have to be designed in the system first.

`kb/dev-docs/content-creator/item-frontmatter.md` is regenerated accordingly. No
note in this repository authored any of the five, so no content changes — but a
note that does is now an unknown-key error rather than a value quietly dropped.

**Bump**

_Minor._ Three of the five were part of the authored frontmatter vocabulary. No
change to stored data, emitted documents, or the manifest.
