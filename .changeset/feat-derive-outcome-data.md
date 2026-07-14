---
"sohl": patch
---

**Derive result text and success stars on read instead of storing them (#205)**

A `SuccessTestResult` stored its outcome three ways: the raw `successLevel`
(the true datum), the full description table, **and** the already-rendered
`resultText` / `resultDesc` / `successStars` derived from that table. The derived
copies were redundant — and a stale-copy hazard: change the table and the frozen
strings no longer agree.

`resultText`, `resultDesc`, and `successStars` are now **getters** that resolve the
description table against the result's evaluated `successLevel` / `targetValue` /
`lastDigit` on each read. `toJSON` no longer emits any of the three — the wire form
carries only the raw `successLevel` (the one deliberately cached derived value) and
the table (which already rides the wire as data, #206). `toChat` folds the derived
strings into the chat-card data, rendered once by the sender. Legacy serialized
results that still contain the three fields are simply ignored on revival and
recomputed. This keeps a single source of truth, per the subsystem's
_store only the minimum; never serialize what an in-memory object recomputes_ rule.
