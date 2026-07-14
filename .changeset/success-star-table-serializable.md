---
"sohl": patch
---

**Make success-star / result-description tables serializable as data (#206)**

A `SuccessTestResult.LimitedDescription` table maps a test outcome to a
descriptive label — the mechanism for meaningful result text ("You go screaming
down the halls in terror") rather than a bare "Critical Failure". Its computed
`label` / `description` / `result` fields were **raw JavaScript functions**, which
`JSON.stringify` drops silently, so a table could not cross to another client — a
latent break as soon as anything on the receiver relies on it, and a blocker for
author-supplied custom tables that must render for every player.

Those fields are now `string | number | SafeExpression` instead of literal-or-
function. A `SafeExpression` is **data** (a sandboxed source string), so the whole
table serializes and revives with no registry and no cross-client module-install
requirement — following the subsystem's reference-on-wire / live-object-in-memory
rule. `toJSON` reduces each expression via `serializeLimitedDescriptionTable`; the
constructor rehydrates it via `reviveLimitedDescriptionTable`, owned by the
result's parent. The standard success-level table's two computed rows
(`successLevel ± 1`) become `SafeExpression`s; the literal tables are unchanged.

Adds the [Result-description Tables](docs/reference/result-description-tables.md)
developer reference. Computed **string** labels/descriptions need richer
`SafeExpression` string operations, tracked separately; this change needs only the
existing numeric expressions. No runtime behavior change to the shipped tests.
