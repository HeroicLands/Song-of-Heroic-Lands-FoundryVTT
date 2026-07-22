---
"sohl": minor
---

**Seedable, Foundry-free PRNG (`sohl.random`) — reproducible randomness**

Adds a self-contained, seedable pseudo-random number generator to the
Foundry-free logic layer and routes all direct randomness through it, so a seed
makes a whole stream of rolls and selections reproducible (combat replay,
"what just happened" debugging, property/fuzz tests) without depending on
Foundry's `Roll` / `MersenneTwister`.

**The generators (issue #599).** A small `Rng` interface — `float()`,
unbiased `uint32(bound)` / `int(min, max)` / `die(sides)`, plus the
`seed()` / `getState()` / `setState()` control surface — with two 32-bit
implementations behind it: `Sfc32Rng` (the default) and `Xoshiro128Rng` (an
interchangeable alternative). Integer extraction uses **rejection sampling** so
it is bias-free even on d100-scale hit-location tables. Seeds accept a string
(hashed via `cyrb128`), a number, or the four state words directly; an all-zero
state is guarded. The output for a given seed is a **frozen contract**, locked by
golden-value tests.

- **Reentrant / injectable.** Every generator holds its entire state in instance
  fields — no module-level or `static` mutable state, no shared scratch buffer —
  so any number of `Rng` streams run interleaved with zero cross-talk. Injection
  is the first-class path; a flow that must not perturb another holds its own
  instance.
- **`sohl.random` singleton.** One shared, entropy-seeded stream, present from
  system construction (its own ready signal), exposed for macros, the app, and
  e2e. It is the default-injected source but is **never** hardcoded into
  consumers — `SimpleRoll` and hit-location take an optional `Rng` and fall back
  to it only when none is passed.
- **Guardrail.** Production seeds from `crypto.getRandomValues` and never accepts
  a fixed seed through a play path — fixed seeds are strictly a test/e2e
  affordance (predictable dice ruin play, and a shared deterministic stream
  desyncs across clients anyway).

**Routing the non-dice sources through it (issue #601).** `weightedRandom`, the
`BodyStructure` hit-location spread, `BodyPart`/`BodyStructure` location
selection, and the `rand()` expression helper now all draw from an injectable
`Rng` (defaulting to `sohl.random`) instead of `Math.random`. No behavior change
in normal play — the continuous draws stay statistically identical — but a seed
now forces a hit location deterministically end to end.

`SimpleRoll.forceValues(...)` (the #598 forced-value queue) is unchanged and
still takes precedence over the `Rng`: forced values give targeted determinism
for a single roll; a seed gives reproducibility of the whole stream.

**Tests.** Unit specs cover reproducibility, independence, boundary correctness
(`die`/`int` endpoints, never 0 / `sides+1`), d100 bias (chi-square),
state snapshot/replay, the zero-state guard, reentrant interleaving, and frozen
golden streams; `SimpleRoll` and `BodyStructure` gain seeded-determinism specs.
A new e2e (`seedable-random.cy.js`) re-seeds `window.sohl.random` and drives a
real skill success test and the `rand()` helper reproducibly.

Closes #599, #601. Refs #598.
