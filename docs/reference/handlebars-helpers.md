# Handlebars Template Helpers

See also: [CSS Architecture](../concepts/css-architecture.md), [Calendar](./calendar.md)

SoHL registers a set of global [Handlebars](https://handlebarsjs.com/) helpers at
system init (in `registerHandlebarsHelpers`, `src/sohl.ts`). They are available
in **every** `.hbs` template the system renders — sheets, parts, and dialog
bodies alike.

These are **in addition to** the helpers Foundry itself provides
(`formGroup`/`formInput`, `localize`, `numberFormat`, `selectOptions`,
`checked`, `editor`, the `eq`/`lt`/`and`/`or` logic set, …). This page documents
only the **SoHL-specific** helpers; for the Foundry-provided ones see Foundry's
own API docs.

Convention notes:

- **Hash arguments** are Handlebars named arguments, written `key=value`.
- Input-building helpers return escaped HTML (a `SafeString`); the value/logic
  helpers return plain values usable inside `{{…}}` or `{{#if …}}`.

---

## Form & input helpers

### `textInput`

`{{textInput value ...config}}` — render a text `<input>` built from Foundry's
`createTextInput`, passing every hash option through as input config.

| Argument   | Kind       | Description                                        |
| ---------- | ---------- | -------------------------------------------------- |
| `value`    | positional | The current value.                                 |
| `name`     | hash       | The form field path (e.g. `"system.notes"`).       |
| `class`    | hash       | Extra CSS class applied to the element.            |
| _(others)_ | hash       | Forwarded to `createTextInput` (`placeholder`, …). |

```hbs
{{textInput system.society name="system.society" placeholder="Guild"}}
```

### `selectArray`

`{{selectArray choices ...}}` — build `<option>` elements from a **string
array**. Place it inside your own `<select>`.

| Argument   | Kind       | Description                                                  |
| ---------- | ---------- | ------------------------------------------------------------ |
| `choices`  | positional | Array of strings (each used as both option value and label). |
| `selected` | hash       | Value (or array of values) to mark selected.                 |
| `blank`    | hash       | If set, prepends a blank option with this label.             |
| `sort`     | hash       | `true` to sort options alphabetically by label.              |

```hbs
<select name="importantChoice">
    {{selectArray choices selected=system.choice blank="—" sort=true}}
</select>
```

### `clearableNumberInput`

`{{clearableNumberInput field name=… value=…}}` — a number `<input>` paired with
a "×" clear affordance, for **nullable** number fields. Emptying a plain number
input does not reliably serialize to `null`, so the "×" fires the sheet's
`clearField` action, which writes `null` explicitly via `document.update`. When
given a `DataField` it delegates to `field.toInput` (inheriting the schema's
`integer`/`min`/…); otherwise it uses `createNumberInput`.

| Argument | Kind       | Description                                       |
| -------- | ---------- | ------------------------------------------------- |
| `field`  | positional | The schema `DataField`, or omit and pass `value`. |
| `name`   | hash       | The update path (also the clear target).          |
| `value`  | hash       | The current value.                                |
| `class`  | hash       | Extra CSS class.                                  |

```hbs
{{clearableNumberInput
    fields.diagnosisBonusBase
    name="system.diagnosisBonusBase"
    value=system.diagnosisBonusBase
}}
```

### `datePicker`

`{{datePicker value name=…}}` — a **calendar-aware** editor for a numeric
**worldTime** field (seconds since the calendar epoch, as in
`game.time.worldTime`). It renders the current value formatted by the active
calendar plus a calendar-icon button that opens the picker dialog
(`data-action="pickDate"` → the sheet's `pickDate` action →
{@link sohl.apps.foundry.openDatePickerDialog}). The field **stores and returns
the numeric worldTime**; only display and editing use calendar format.

| Argument | Kind       | Description                                            |
| -------- | ---------- | ------------------------------------------------------ |
| `value`  | positional | The current worldTime (seconds), or `null` when unset. |
| `name`   | hash       | The update path (e.g. `"system.treatmentDate"`).       |

The dialog offers a month dropdown, day/year and hour/minute/second inputs, a
±N-day stepper (rolling months/years over correctly), **Now** (current world
time) and **Clear** (empty) buttons, a live preview, and a red
"Invalid Date Format" message when the parts don't resolve to a real date. The
worldTime ↔ calendar-parts conversion lives in the Foundry-free
{@link sohl.core.logic.datePartsToWorldTime | date-picker-logic} module.

```hbs
{{datePicker system.treatmentDate name="system.treatmentDate"}}
```

---

## Calendar & world time

### `displayWorldTime`

`{{displayWorldTime value format=…}}` — format a worldTime value (seconds) with
the active calendar. Read-only (no input); safe on any installed calendar (the
`sohl.*` formatters degrade gracefully on foreign calendar classes) and returns
`""` for an empty/non-finite value.

| Argument   | Kind       | Description                                                                           |
| ---------- | ---------- | ------------------------------------------------------------------------------------- |
| `value`    | positional | The worldTime (seconds).                                                              |
| `format`   | hash       | Formatter name; default `"sohl.default"`. Also `"sohl.timestamp"`, `"sohl.relative"`. |
| _(others)_ | hash       | Passed to the formatter (e.g. `short`, `maxTerms` for `sohl.relative`).               |

```hbs
{{displayWorldTime injury.nextHealingCheck}}
{{displayWorldTime t format="sohl.timestamp"}}
{{displayWorldTime t format="sohl.relative" short=true maxTerms=2}}
```

See the [Calendar reference](./calendar.md) for the calendar model and formats.

---

## Data construction

### `object`

`{{object a=1 b=2}}` — build a plain object from the hash arguments. Useful for
passing an inline options bag to a partial.

```hbs
{{> row (object label="STR" value=system.str)}}
```

### `array`

`{{array a b c}}` — build an array from the positional arguments.

```hbs
{{#each (array "head" "torso" "arms")}}{{this}} {{/each}}
```

### `concat`

`{{concat a b c}}` — concatenate the (non-object) positional arguments into one
string. Handy for building ids/keys.

```hbs
<div id="{{concat 'attr-' attribute.id}}"></div>
```

### `arrayToString`

`{{arrayToString ary}}` — join an array with commas.

```hbs
<span>{{arrayToString system.tags}}</span>
```

### `toJSON`

`{{toJSON obj}}` — `JSON.stringify` the value (debugging / `data-*` payloads).

```hbs
<template data-init="{{toJSON context}}"></template>
```

---

## Predicates & conditionals

### `contains`

`{{#contains container value}}…{{else}}…{{/contains}}` — **block** helper:
renders the block when `container.includes(value)` (array or string), else the
`{{else}}` inverse.

```hbs
{{#contains system.roles "vital"}}Vital{{else}}—{{/contains}}
```

### `setHas`

`{{setHas set value}}` — `true` when the JS `Set` contains `value`.

```hbs
{{#if (setHas selectedIds effect.id)}}selected{{/if}}
```

### `endswith`

`{{endswith str suffix}}` — `true` when `str` ends with `suffix`.

```hbs
{{#if (endswith key ".label")}}…{{/if}}
```

### `optionalString`

`{{optionalString cond strTrue strFalse}}` — returns `strTrue` when `cond` is
truthy, otherwise `strFalse` (both default to `""`).

```hbs
<td class="{{optionalString effect.disabled 'disabled' ''}}">…</td>
```

---

## Lookups & transforms

### `getProperty`

`{{getProperty object key}}` — dotted-path lookup via `foundry.utils.getProperty`.

```hbs
{{getProperty actor (concat "system.attributes." code)}}
```

### `toLowerCase`

`{{toLowerCase str}}` — lower-case a string.

```hbs
<i class="fa-solid fa-{{toLowerCase iconName}}"></i>
```

---

## Domain formatting

### `injurySeverity`

`{{injurySeverity value subType}}` — format a trauma severity level, dispatching
on the trauma subtype:

| subType     | 0    | N                                             |
| ----------- | ---- | --------------------------------------------- |
| `physical`  | `NA` | `M1`/`S2`/`S3`/`G4`/`G5` for 1–5, then `G{N}` |
| `mental`    | `—`  | `PSY {N}`                                     |
| `spiritual` | `—`  | `AS {N}`                                      |
| `shadow`    | `—`  | `SL {N}`                                      |

Any other subtype falls back to the bare number.

```hbs
<td>{{injurySeverity trauma.level trauma.subType}}</td>
```
