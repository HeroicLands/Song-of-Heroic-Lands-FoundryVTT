---
"sohl": minor
---

**Build-time localization-key coverage check**

A new `lint:lang-coverage` step (`utils/check-lang-coverage.mjs`, wired into the
`lint` chain and therefore `build:noci`) verifies that every localization key the
system references exists in `lang/en.json`, and **fails the build** when one is
missing.

It gathers references two ways: concrete `SOHL.*` / `TYPES.*` string literals (read
from the TypeScript AST, so JSDoc `@example` keys are ignored), and the labels a
`defineType(prefix, def)` bundle generates — but only when that bundle's
`labels`/`choices` is actually **consumed**, so internal `kind`-only registries
whose labels are a byproduct are not required to have entries. `defineType`
prefixes, DataModel `LOCALIZATION_PREFIXES`, and dynamic `` `SOHL.X.${type}` ``
template heads are treated as namespaces rather than concrete keys. Unreferenced
en.json keys are reported as a non-fatal warning (`--unused` lists them).

To make every `defineType` call statically analyzable, no-substitution backtick
prefixes were switched to straight quotes and computed `[ITEM_KIND.X]` /
`[ACTOR_KIND.X]` property keys inlined to their literal values (behavior-preserving).

The check also uncovered and fixed real gaps: three references pointing at wrong
keys (`SOHL.SUCCESSTESTRESULT.evaluate.NoPerm`, `SOHL.DELTAINFO.DISABLED`,
`SOHL.TestResult.SUCCESS`/`.FAILURE`) now point at the existing correct keys, and
29 genuinely-missing keys were added. `lang/en.json` is now sorted.

Closes #946
