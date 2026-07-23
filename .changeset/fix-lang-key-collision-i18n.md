---
"sohl": patch
---

**Fix a localization-key collision that silently dropped all SoHL translations**

`lang/en.json` defined `"SOHL.Trauma.Pall"` as a string leaf **and**
`"SOHL.Trauma.Pall.Note.*"` as a branch under the same path. Foundry runs
`foundry.utils.expandObject` on every translation file as it loads it, and that
throws when a key is a strict dotted-prefix of another (`Cannot create property
'Note' on string 'The Pall'`). Foundry catches the throw and discards the
**entire** file — so a single colliding pair dropped _all_ `SOHL.*` and `TYPES.*`
strings and every SoHL label rendered as its raw key.

- Align the Pall trauma with its sibling traumas (`SOHL.Trauma.Fear`,
  `SOHL.Trauma.Morale`) by moving its name to `SOHL.Trauma.Pall.DefaultSource`, so
  `SOHL.Trauma.Pall` is a pure branch and no key is both a leaf and a branch.
- Add a `lint:lang` build guard (`utils/check-lang.mjs`, wired into `lint`) that
  fails the build fast — before the type-check and tests — on any dotted-prefix
  key collision in a `lang/*.json` file, so this class of regression can never
  ship again.

Closes #636
