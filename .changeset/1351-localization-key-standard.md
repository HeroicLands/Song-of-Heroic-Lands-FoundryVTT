---
"sohl": patch
---

**Localization keys now have a written naming standard, and the two namespaces that
were spelled twice are consolidated.** `lang/en.json` had no naming rule, so each
namespace imitated whatever was nearest — which produced five spellings for the same
role and, in two places, two homes for one concept.

**The standard.** `kb/dev-docs/reference/localization-keys.md` publishes it: keys are
`SOHL.<Namespace>[.<Group>].<leaf>`, where the namespace is a singular PascalCase
_concept_ (`SOHL.Action`, never `SOHL.SohlAction`), group segments are PascalCase with
ALL-CAPS reserved for Foundry's own `FIELDS`, leaves are camelCase or an enum's stored
value, and placeholders are single-braced `{camelCase}`. No method names and no data —
paths, UUIDs, names — in a key segment. It also records the `expandObject`
leaf-or-branch rule, and the narrow conditions under which a key may be renamed despite
being permanent. `CLAUDE.md` and _System Development_ link to it.

**`TYPE.*` → `TYPES.*`.** The pre-v10 `TYPE.ACTOR.*` / `TYPE.ITEM.*` document-type
labels duplicated `TYPES.Actor.*` / `TYPES.Item.*` with identical values. The 17 old
keys are gone; `SohlLogic.typeLabel` and the active-effect target label now read the
`TYPES.*` root Foundry itself reads.

**`SOHL.Actions.*` → `SOHL.Action.*`.** The actions-panel strings sat in a plural
namespace beside the singular `SOHL.Action` concept. The 15 live keys moved onto
`SOHL.Action`, with every call site in `src/`, `templates/`, and `tests/` updated in the
same change.

A guard (`tests/guards/lang-key-naming.test.ts`) holds all three: no `TYPE.*` root,
every actor and item kind labelled under `TYPES.*` singular and plural, no plural
namespace shadowing a singular one, no _new_ class-named namespace, and
`{camelCase}` placeholders throughout.

(Closes #1351.)
