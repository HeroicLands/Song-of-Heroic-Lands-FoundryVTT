# Result-description tables

A **result-description table** (a `SuccessTestResult.LimitedDescription[]`) maps a
test outcome to a **descriptive label** — the mechanism that lets a test report
"You go screaming down the halls in terror" instead of a bare "Critical Failure".
Every success test resolves its outcome through one of these tables to produce the
`resultText` / `resultDesc` shown on the chat card, plus a numeric star/quality
count.

They are an **extension point**: the system ships a few built-ins, and a table can
be supplied per test so authors can attach meaningful, flavorful descriptions.

## The row shape

Each row of a table is a `LimitedDescription`:

| Field         | Type                       | Meaning                                                                  |
| ------------- | -------------------------- | ------------------------------------------------------------------------ |
| `maxValue`    | `number`                   | Upper bound (inclusive) of the test's **target value** this row matches. |
| `lastDigits`  | `number[]`                 | Roll last-digits this row applies to; empty matches any.                 |
| `success`     | `boolean`                  | Whether the row is a success.                                            |
| `label`       | `string \| SafeExpression` | The result label (`resultText`).                                         |
| `description` | `string \| SafeExpression` | The result description (`resultDesc`).                                   |
| `result`      | `number \| SafeExpression` | The numeric result/quality (e.g. star count).                            |

Resolution finds the first row (sorted by `maxValue`) whose `maxValue >= targetValue`
and whose `lastDigits` matches the roll's last digit, then writes its
`label`/`description` and returns its `result`.

## Literal or computed fields

`label`, `description`, and `result` may each be a **literal** or a
{@link sohl.entity.expr.SafeExpression} computed at resolution time. A computed
field is evaluated against these bindings:

- `successLevel` — the test's success level.
- `targetValue` — the resolved target value.
- `lastDigit` — the roll's last digit.

```ts
import { SafeExpression } from "@src/entity/expr/SafeExpression";

// A row whose star count is one more than the (negative) success level.
const row = {
    maxValue: -1,
    lastDigits: [],
    success: false,
    label: "You go screaming down the halls in terror",
    description: "",
    result: new SafeExpression({ source: "successLevel + 1" }, { parent }),
};
```

> **Why `SafeExpression`, not a raw function?** A computed field must be a
> `SafeExpression`, never a JavaScript function. A function is dropped silently by
> `JSON.stringify` (and reviving one is forbidden by the
> [security model](../concepts/security-model.md)), so a table with a raw function
> could not cross to another client — the player watching would see nothing. A
> `SafeExpression` is **data** (a source string evaluated in the sandbox), so the
> whole table serializes and every client renders the same flavor text.
>
> `SafeExpression` today covers numbers, booleans, comparisons, string literals,
> and `+` concatenation — enough for a computed `result`. Richer **string**
> operations for computed `label`/`description` text (`toUpper`, `concat`, `trim`,
> …) are tracked separately.

## Serialization

Because a result crosses between clients (a chat card seen by every player), its
table rides the wire as **pure data**, following the subsystem's
reference-on-wire / live-object-in-memory rule:

- **`toJSON`** reduces each computed field to its serialized form via
  `serializeLimitedDescriptionTable` — a `SafeExpression` becomes its
  `__kind`-tagged source string; literals pass through. (Emitting a live
  `SafeExpression` would recurse into its parent back-reference during the
  `undefined→null` pass — see the helper's note.)
- **The constructor** revives each field via `reviveLimitedDescriptionTable`,
  rehydrating a serialized expression into a live `SafeExpression` owned by the
  result's parent logic.

## Where tables come from

- **Built-ins** — {@link sohl.entity.modifier.MasteryLevelModifier}'s default
  `testDescTable` (the standard success-level table) and `svTable` (the
  success-value table); the skill fate table.
- **Per test** — a {@link sohl.entity.modifier.MasteryLevelModifier} may be built
  with a custom `testDescTable`/`svTable`, or a result with a custom
  `successStarTable`, to attach a bespoke set of descriptions to that test.
