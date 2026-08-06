---
"sohl": patch
---

**Fix: an untreated wound's Healing Test now resolves as a Critical Failure instead of being skipped**

`TraumaLogic.healingCheck` gated its whole per-checkpoint loop on the wound being
treated, so an untreated wound resolved nothing at all — no test, and therefore none
of a critical failure's consequences. The rule is that a wound with no Healing Rate to
test against is resolved as though its roll were a **Critical Failure**, the same way
its treatment roll is; no die is cast.

Each elapsed checkpoint on such a wound — untreated, or treated with the Healing Rate
still undetermined (`null`) — now resolves as a Critical Failure: the Injury Level
makes no progress, and the wound contracts an infection.

**Untreated wounds are infection-prone.** The infection branch previously required
`system.infectable`, which only a Treatment Test ever sets — so no freshly inflicted,
untreated wound could ever qualify, and the rule would have been inert for exactly the
wounds it describes. Resolving an untreated wound as a critically-failed treatment is
the same rule that leaves such a wound exposed to infection, which the `UNTREATED`
baseline in the logic layer already declared (`infect: true`) without any consumer. It
now has one.

Unchanged: an active infection still halts _all_ healing, so a halted wound resolves
nothing rather than auto-failing, and a wound already at Level 0 is not checked again.
Recording an explicit Healing Rate of `0` is still a rate and still rolls (against an
effective mastery level of 0) — it is not the same state as "no rate determined".

Closes #1146
