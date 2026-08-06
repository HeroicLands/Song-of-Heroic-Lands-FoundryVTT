---
"sohl": patch
---

**Fix: the Treat Injury dialog no longer promises that Healing Rate 0 heals the wound**

The hint under the Treat Injury dialog's Healing Rate field read _"(0 heals it
outright)"_. It does not: the outright-heal sentinel is a `HEAL` value that only a
Treatment Result card can supply, so a typed `0` was recorded as a Healing Rate of 0
— a wound whose Healing Tests roll against `Healing Base × 0` and therefore never
mend. The hint led a GM into recording the worst available outcome while believing
they had cured the wound.

The hint now describes the field truthfully: Healing Tests roll against Healing Base
× Healing Rate, so a higher rate heals faster, 0 fails every check and leaves the
wound making no progress at all, and a blank field records no rate. The dialog's
label and hint are also localized (`SOHL.Dialog.TreatInjury.*`) rather than hardcoded
English, matching the sibling Treatment Test dialog.

The same conflation appeared in the field's default. A wound whose Healing Rate is
still undetermined stores `null`, but the dialog coalesced that to `0` — so an
untreated wound opened pre-filled with the worst available rate, one blind confirm
away from being recorded. The field now opens **blank** for an undetermined rate, and
a blank submission records nothing rather than the `0` that `Number("")` yields.

Recording behavior is otherwise unchanged and now has regression tests: a rate
entered by hand is only ever recorded as a Healing Rate and never alters the wound's
Injury Level.

Closes #1087
