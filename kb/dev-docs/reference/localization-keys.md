# Localization Keys

See also: [System Development](../contributing/system-development.md), [Handlebars Template Helpers](./handlebars-helpers.md), [Runtime Contracts](./runtime-contracts.md)

Every user-visible string in the system is a key in `lang/en.json`. This page is the
**naming standard** for those keys: what a key is called, how it is shaped, and what
may never appear in one.

The file is large and long-lived, and keys are effectively permanent (see
[Keys are permanent](#keys-are-permanent) below), so a key named badly stays named
badly. Before this standard was written each namespace imitated whatever was nearest,
which produced five competing spellings for the same role — `CODE` beside `SubType`
beside `Category`, `SHEET` beside `Heading`, `SohlItem` beside `Item`. Everything
below exists to stop that recurring.

**The standard applies to every key you add.** It does _not_ license renaming the keys
already in the file — read [Keys are permanent](#keys-are-permanent) first.

## Key shape

```
SOHL.<Namespace>[.<Group>].<leaf>[.label|.hint]
```

| Segment       | Case                                      | Example                            |
| ------------- | ----------------------------------------- | ---------------------------------- |
| root          | `SOHL`, or a Foundry-mandated root        | `SOHL`, `TYPES`                    |
| `<Namespace>` | PascalCase, **singular**, the concept     | `Action`, `Skill`, `ActiveEffect`  |
| `<Group>`     | PascalCase (optional)                     | `SubType`, `Column`, `Heading`     |
| `<leaf>`      | camelCase, or the enum's stored value     | `editMacro`, `search`, `intrinsic` |
| suffix        | `label` / `hint` where Foundry reads them | `title.label`, `title.hint`        |

Worked examples:

```jsonc
"SOHL.Action.search": "Search Actions",              // namespace + leaf
"SOHL.Action.SubType.intrinsic": "Intrinsic",        // enum group + stored value
"SOHL.Skill.FIELDS.masteryLevelBase.label": "ML",    // Foundry auto-localization
"TYPES.Item.weapongear": "Weapon",                   // Foundry-mandated root
```

## The root segment

`SOHL` is the root for everything the system owns. Use another root **only** where
Foundry itself reads that root:

- `TYPES.<Document>.<subtype>` — document sub-type names. Foundry reads these
  directly for the create dialog and the sidebar; a `TYPES.Item.skillPl` plural
  form goes beside each. This is the current form. The pre-v10 `TYPE.ITEM.*` /
  `TYPE.ACTOR.*` spelling is gone — never reintroduce it.
- `BEHAVIOR.TYPES.*` — Region Behavior sub-types, likewise read by core.

Do not invent a new root. A concept that feels root-worthy is a `SOHL.<Namespace>`.

## Namespaces name a concept, not a class

The namespace is the **domain concept** the strings belong to, spelled as the reader
of the UI would name it:

```jsonc
"SOHL.Item.…"        // ✅ the concept
"SOHL.SohlItem.…"    // ❌ the implementation class
```

`SohlItem`, `SohlLogic`, `SohlCombatant`, `SohlContextMenu` are class names — internal,
refactorable, and meaningless to a translator. `Item`, `Combatant`, `ContextMenu` are
concepts. Strings live under the concept.

Three consequences:

- **Singular.** `SOHL.Action`, never `SOHL.Actions` — a namespace is the concept, not a
  collection of instances. A plural namespace beside a singular one is the collision
  this rule exists to prevent.
- **One namespace per concept.** Before adding `SOHL.Foo`, grep for an existing home.
  A namespace holding one key almost always belongs inside an existing one.
- **DataModel prefixes follow the same names.** A DataModel's `LOCALIZATION_PREFIXES`
  lists concept namespaces (`["SOHL.Skill", "SOHL.MasteryLevel"]`), and Foundry reads
  `<prefix>.FIELDS.<field>.label` / `.hint` from them — so the namespace you pick here
  is the one the schema auto-localizes against.

## Group segments are PascalCase

A `<Group>` segment names a **set** of related keys — an enum's members, a table's
column headings, a card's sections. Spell it PascalCase:

```jsonc
"SOHL.Action.SubType.intrinsic": "Intrinsic",
"SOHL.Action.Column.action": "Action",
"SOHL.Trauma.FearCategory.brave": "Brave",
```

**ALL-CAPS group names are reserved for segments Foundry itself defines** — `FIELDS`
above all, plus `TYPES` in the `TYPES.*` root. An ALL-CAPS segment therefore reads as
"this one is Foundry's"; anything shouting that Foundry does not read is
mis-signalling. Do not add `SOHL.X.CODE.*`, `SOHL.X.TERM.*`, `SOHL.X.ACTION_SCOPE.*`
style groups.

The group segment is **optional**. Use one when the keys form a set; a handful of
unrelated strings sit directly on the namespace (`SOHL.Action.search`).

### Enum groups and `defineType`

An enum's labels come from `defineType(prefix, …)` in `src/utils/constants.ts`, which
builds `<prefix>.<storedValue>` for each member (falling back to the constant's key for
numeric values and for change-paths containing `.` or `:`). So the prefix you pass
_is_ the namespace-plus-group, and the leaves are the **stored values**:

```ts
export const { kind: ACTION_SUBTYPE, choices: ActionSubTypeChoices } = defineType(
  "SOHL.Action.SubType",
  {
    INTRINSIC: "intrinsic",
    SCRIPT: "script",
  },
);
```

```jsonc
"SOHL.Action.SubType.intrinsic": "Intrinsic",
"SOHL.Action.SubType.script": "Script",
```

Naming the group after the field it labels (`SubType`, `Category`, `Aspect`) keeps the
key readable at the call site. Note that a `defineType` bundle's labels only reach the
UI when its `labels`/`choices` export is actually consumed — an unconsumed bundle
produces dead keys, not live ones.

**Borrowing a label that already has an owner.** When a member restates a word another
namespace owns, point it at that owner with `defineType`'s optional third argument
rather than minting a duplicate — every gear subtype's `WEIGHT` effect key resolves to
`SOHL.Gear.FIELDS.weightBase.label` this way:

```ts
} = defineType("SOHL.MiscGear.EffectKey", {
    WEIGHT: "mod:logic.weight",
    SPECIAL: "mod:logic.special",
}, {
    WEIGHT: "SOHL.Gear.FIELDS.weightBase.label",  // borrowed
});                                               // SPECIAL still mints its own
```

Members left out keep the default `<prefix>.<segment>` key. A duplicated label is a
translation bug waiting to happen: the two copies get localized independently, drift,
and the same field then reads two ways on two sheets.

### Generic words live in `SOHL.Common`

A word that belongs to no concept in particular — `None`, `Menu`, `Expand`,
`Drag to reorder`, `Parent`, `Shortcode` — goes in `SOHL.Common.*`, once. Do not mint a
per-namespace copy of it.

## Leaves are camelCase

A leaf is camelCase (`editMacro`, `nameRequired`, `removeHint`) — or, for an enum
group, the enum's **stored value** verbatim, which is how runtime code reconstructs the
key from stored data.

Not permitted:

- **`snake_case`** (`volley_2`, `broken_ground`) — nothing else in the file uses it.
- **Bare numbers** (`SOHL.ValueDelta.Operator.3`) where a name would read. A numeric
  enum should be labelled by its constant's key, which `defineType` already does for
  non-string values; a numeric leaf tells a translator nothing about what they are
  translating.
- **ALL-CAPS** leaves. Case carries meaning only at the group level.

`label` and `hint` are the two blessed suffixes, because Foundry's DataModel
auto-localization looks for exactly those.

## No method names in keys

A key must never be named after the function that happens to build it:

```jsonc
"SOHL.Being._createTestItem.dialog.title": "…",   // ❌
"SOHL.Being.createTest.title": "…",               // ✅ names the user-facing thing
```

Because keys are permanent, a key named after a private method **freezes that method's
name forever** — or, once the method is renamed, leaves a key that lies about where its
string is used. Name the key after what the user sees (the dialog, the button, the
column), never after the code path that reaches it.

## No data in key segments

Key segments are identifiers, not payloads. A file path, a UUID, a shortcode, or a
user-authored name must never be baked into a key:

```jsonc
"SOHL.SohlSpeaker.SOUND.sounds/dice.wav": "Dice",   // ❌ a path inside a key
"SOHL.Speaker.Sound.dice": "Dice",                  // ✅ the path is the value
```

Besides being unreadable, embedded data invites the `expandObject` collision below: a
dotted payload silently becomes extra branches (`sounds/dice` → `wav`), so any sibling
leaf can trip it.

## Placeholders

Interpolated values use **single braces** and a **camelCase** name matching the key
passed at the call site:

```jsonc
"SOHL.Action.run": "Run {name}",
"SOHL.ActiveEffect.targetLabel.ThisActor": "This actor ({actorName})",
```

```ts
sohl.i18n.format("SOHL.Action.run", { name: action.title });
```

Never `{{double}}`, never `%s`, never positional indices. Give the placeholder the same
name as the thing it interpolates, so a translator can reorder it safely.

## Structural rules

### A key is a leaf **or** a branch, never both

Foundry runs `foundry.utils.expandObject` over the whole file as it loads it, and it
**throws** when one key is a strict dotted prefix of another —
`"SOHL.Trauma.Pall"` as a string alongside `"SOHL.Trauma.Pall.Note"`. Foundry catches
the throw and discards the **entire file**, so one colliding pair drops every SoHL
string and the UI renders raw keys (#636).

`npm run lint:lang` (`package-build lang check`) fails the build on any such pair. If you
need both a label for a thing and keys beneath it, give the label its own leaf:
`SOHL.Trauma.Pall.label` plus `SOHL.Trauma.Pall.Note`.

### Sorted, contiguous, no stray whitespace

The file is sorted and each namespace occupies one contiguous block. Insert new keys in
sorted position rather than appending; Prettier handles the formatting, but not the
ordering.

### Every user-visible string is a key

A literal English string in a `.hbs` template or in TypeScript is a bug, not a
shortcut — it is invisible to translators. Two guards enforce this from opposite
directions (`lint:lang-coverage` and `lint:lang-hardcoded`); see
[The guards](#the-guards). Text stored for later display (a `disabledReason`, a queued
warning) stores the **key** and is localized at render.

## Keys are permanent

`CLAUDE.md` rule 4 and
[System Development](../contributing/system-development.md#core-rules-non-negotiable)
both say it: **never rename an existing key**. A world, a module, or a community
translation file may reference it, and a rename breaks all three silently — the string
just renders as its raw key.

So this standard is forward-looking. Applying it retroactively is allowed only when:

1. **The key is provably dead** — nothing in `src/`, `templates/`, or a `defineType`
   bundle or `LOCALIZATION_PREFIXES` entry reaches it. A dead key carries no
   compatibility risk, so it may be renamed or deleted outright.
2. **A maintainer has scoped the rename**, as part of a tracked cleanup issue, for a
   live key whose only possible external consumer is a translation module. Such a
   change updates every in-repo call site in the same commit and is called out in the
   changeset.

Anything else — renaming a live key because you prefer the new spelling — is exactly
the churn rule 4 forbids. Add the correctly-named key and leave the old one alone, or
file an issue.

`npm run lint:lang-coverage` decides deadness for you and **reports** an unreferenced
key without failing the build — see [The guards](#the-guards) for what it can and
cannot see, and for the one sanctioned way to keep a key it cannot. A report rather
than a failure because no scan sees every way a key is reached, and a guard that fails
a build over one teaches everybody to switch it off; a key it _does_ report is still a
key to delete unless you can say why not.

## The guards

Three checks run in `npm run lint`, and between them they cover both directions — a key
with no string, and a string with no key. All three are
`@heroiclands/package-build`'s, so every HeroicLands package is held to the same rules
rather than this one running scripts nobody else can run.

| Check                                                  | Fails on                                                                                                                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lint:lang` (`package-build lang check`)               | A key that is both a leaf and a branch (the `expandObject` collision above); a value using `{{…}}` or an unbalanced brace; a key segment outside `[A-Za-z0-9_-]`. |
| `lint:lang-coverage` (`package-build lang coverage`)   | A referenced key missing from `en.json`. An `en.json` key nothing references is **reported, not failed** — see above.                                             |
| `lint:lang-hardcoded` (`package-build lang hardcoded`) | User-visible English left in a template; a template that fails to compile.                                                                                        |

`lint:lang-coverage` prints the first twenty unreferenced keys and says how many more
there are; `npx package-build lang coverage --unused` lists every one.

### What `lint:lang-coverage` can and cannot see

It resolves concrete string literals (including keys inside inline HTML in a template
literal), `<PREFIX>.FIELDS.<path>.label|hint` for each declared `LOCALIZATION_PREFIXES`
entry, and a dynamic construction's **shape** — both
`` `SOHL.X.Month.${i}.label` `` and `(concat "SOHL.X.Month." i)` vouch for
`SOHL.X.Month.<segment>.label` and nothing else.

The keys a **consumed** `defineType` bundle generates are SoHL's own convention, which
no shared guard can know. They are contributed by `utils/lang-references.mjs`, named in
`packageBuild.lang.references` and covered by `tests/build/lang-references.test.ts`. A
bundle's labels count as consumed when its `labels`/`choices` is destructured into a
binding that is used, or read as `<result>.labels`/`.choices`; a bundle that yields only
`kind`/`values` localizes its entries through a dynamic `` `${prefix}.${value}` ``
instead, so its label keys are a byproduct and need no entry.

What it cannot see is a key built from a **variable** prefix:

```ts
// defineImproveSdrActions(titlePrefix) — the prefix is a parameter, so no static
// analysis can tell which namespace's keys this reaches.
title: `${titlePrefix}.${shortcode}`,
```

…and keys Foundry reads itself without SoHL ever naming them (`TYPES.Item.*` for the
sidebar and create dialog).

### `retained` and `allow` — the escape hatches

Each guard has one allowlist, and both live in `package-build.config.yaml` under
`packageBuild.lang`. Both take the same shape: a prefix (or literal) plus **a reason a
reviewer can check** — the reason is required, not decorative.

- `retained` — keys that are genuinely reachable but invisible to the scan, as above.
- `allow` — template literals that are not prose (a code sample shown as a placeholder,
  say).

```yaml
packageBuild:
  lang:
    retained:
      - prefix: SOHL.Gear.Action.
        reason: Intrinsic action titles built as `${titlePrefix}.${shortcode}`
          — the prefix is a parameter, so no scan can resolve it.
    allow:
      - literal: item.system.code === 'pyrn'
        reason: A SafeExpression example shown as a placeholder — code, not
          prose.
```

**Adding an entry is the exception, not the remedy.** For an unreferenced key the honest
fix is to delete it; for an unlocalized string it is to add the key. Reach for the
allowlist only when the key or string is genuinely reachable-but-invisible, and say why.

### A `{{localize}}` nested in a helper's hash will not compile

This is the usual way to break a template while localizing it, and why
`lint:lang-hardcoded` compiles every one:

```hbs
{{!-- HTML attribute: nesting is fine, it is just text --}}
<div data-tooltip="{{localize "SOHL.X.y"}}">

{{!-- Helper hash argument: MUST be a subexpression --}}
{{formGroup fields.foo placeholder=(localize "SOHL.X.y")}}
```

`{{formGroup … placeholder="{{localize …}}"}}` is a parse error, and a template that
fails to compile takes its whole sheet or card down at render time.

## Checklist for a new key

- [ ] Root is `SOHL` (or a root Foundry reads).
- [ ] Namespace is a **singular PascalCase concept**, not a class name, and already
      exists if the concept does.
- [ ] Group segment, if any, is PascalCase — ALL-CAPS only for `FIELDS`.
- [ ] Leaf is camelCase, or an enum's stored value. No `snake_case`, no bare numbers.
- [ ] No method name and no data (paths, UUIDs, names) in any segment.
- [ ] Placeholders are `{camelCase}`, single-braced.
- [ ] The key is neither a prefix of, nor prefixed by, another key.
- [ ] Inserted in sorted position; `lint:lang`, `lint:lang-coverage` and
      `lint:lang-hardcoded` all pass — see [The guards](#the-guards).
