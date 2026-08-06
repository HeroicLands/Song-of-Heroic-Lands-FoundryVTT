---
"sohl": patch
---

**Fix: a null Healing Rate is now the single source of truth for an untreated wound**

A wound's Healing Rate and its treated state were two independent facts that could
disagree, and neither reliably meant "untreated". Every new wound was created with
`healingRateBase: 0`, so the catastrophic real rate `0` doubled as the stand-in for
"no rate yet"; both outright-heal paths wrote a treatment date and no rate at all;
and nothing kept the pair in step, so either could be edited into contradicting the
other.

The Healing Rate now decides:

- **An untreated wound has no Healing Rate.** A newly inflicted wound is created with
  `null` rather than `0`. A rate of `0` is a real, dire rate that poor treatment
  produced.
- **A null rate means untreated, whatever the treatment date says.** `isTreated`
  requires both a rate and a date, so a stray date can no longer make a rate-less
  wound read as treated.
- **Recording a rate stamps the date.** `TraumaDataModel._preUpdate` sets
  `treatmentDate` the moment the stored rate goes from `null` to a number, so this
  holds for a rate typed straight into the sheet and not only for the treatment
  actions. An update supplying its own date is left alone.
- **A null rate disables the Healing Rate modifier** rather than reading as `0` —
  the treatment `AfflictionLogic` already gave it, which also revives the Being
  ledger's ✗ rendering for injuries.

**How an untreated wound's test resolves.** It has nothing to test against, so no die
is cast: the test is handed the **`00` face** and resolves normally from there — a
Critical Failure whatever the target, because `00` exceeds every target and ends in a
critical-failure digit. This replaces the mechanism merged for #1146, which branched
on the success level directly. The forced value is deliberately not a low one: a `5`
_succeeds_ against any target of 5 or more, and a literal `0` is a critical
_success_ against every target. `rollTimedTest` gains a `forcedDie` option and
`successTest` forwards a caller-supplied `scope.roll` into the result, whose
`evaluate()` already resolved a supplied die untouched.

No migration is included — the system is pre-beta, so existing worlds are not
carried forward.

Closes #1148
