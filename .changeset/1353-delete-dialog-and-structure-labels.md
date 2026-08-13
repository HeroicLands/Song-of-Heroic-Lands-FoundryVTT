---
"sohl": patch
---

**The delete-confirmation dialog named the wrong thing, and Structure declared a
localization prefix that resolved to nothing.**

**Delete confirmation.** The dialog built its document-type name from
`` `TYPE.${documentName.toUpperCase()}.${type}` `` — the pre-v10 root retired in #1351 —
so it read _"Delete TYPE.ITEM.skill: Old Sword"_ instead of _"Delete Skill: Old
Sword"_. It now reads the `TYPES.*` root Foundry itself uses; `documentName` is already
that segment's spelling.

The caution line beneath it was assembled the other way round from every other dialog:
the localized prose was spliced into the template source (`` `<p>${localize(…)}</p>` ``)
and carried a Handlebars `{{docType}}` that only substituted because `dialog()`
compiles `content`. That is the pattern rule #10 forbids. The value now uses Foundry's
single-brace `{docType}` and is interpolated with `format()`, and the template source is
author-static (`<p>{{caution}}</p>`) with the prose riding in `data` — the same shape
`ContainerGearLogic` already used.

**Structure labels.** `StructureDataModel` declared `LOCALIZATION_PREFIXES` of
`["SOHL.Structure", "SOHL.Actor"]`, but Structure adds no fields of its own — its schema
is exactly `SohlActorDataModel`'s — so `SOHL.Structure` had no keys and could never
label anything. Its labels and hints have always come from `SOHL.Actor`; the stale
prefix is removed, to be added back with the first Structure-specific field.

Three guards hold this: no `lang/en.json` value may use Handlebars double braces, every
`SOHL.*` `LOCALIZATION_PREFIXES` entry must resolve to at least one key, and the delete
dialog must name its type from `TYPES.*` with the prose in `data`.

(Closes #1353.)
