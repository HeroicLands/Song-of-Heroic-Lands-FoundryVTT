---
aliases:
    - Randomness
    - PRNG
    - sohl.random
    - Rng
    - SimpleRoll RNG
tags:
    - core-system
    - dice
    - testing
audience: Developers generating randomness in the logic layer, or driving RNG-gated flows deterministically in tests.
---

# Randomness

How SoHL generates randomness, and how to make it **reproducible**. Every direct
random draw in the logic layer — dice, hit-location selection, the `rand()`
expression helper — flows through one small, seedable, Foundry-free generator so
a seed can replay a whole stream (combat replay, bug repro, property tests).

For the exact signature of any call, follow the
{@link sohl.entity.random.Rng | API links}; this page explains the model.

## The mental model: one interface, injectable streams

An {@link sohl.entity.random.Rng} is a seedable generator with a tiny surface:

- `float()` — uniform `[0, 1)`.
- `uint32(bound)` — unbiased integer `[0, bound)` (rejection-sampled).
- `int(min, max)` — unbiased integer, inclusive.
- `die(sides)` — `[1, sides]`.
- `seed(seed)` / `getState()` / `setState(state)` — reset and snapshot the stream.

Two 32-bit implementations sit behind it:
{@link sohl.entity.random.Sfc32Rng} (the **default**) and
{@link sohl.entity.random.Xoshiro128Rng} (an interchangeable alternative).
Construct one with {@link sohl.entity.random.createRng} — with a seed it is fully
reproducible, without one it draws entropy.

**Determinism is a frozen contract.** For a given seed, the output sequence is
fixed forever (golden-value tests lock it). **Not cryptographic** — gameplay and
tests only, never security.

### Unbiased by construction

Integer extraction uses **rejection sampling**, not `floor(float() * n)`. The
naive form has modulo/rounding bias that is negligible for a d6 but visible on a
**d100 hit-location table**, where a skewed bucket boundary shifts real
hit-location odds. `int` and `die` derive from `uint32`, so the whole surface is
bias-free.

### Reentrant / injectable

Every generator keeps its **entire state in instance fields** — there is no
module-level or `static` mutable state and no shared scratch buffer. Any number
of `Rng` instances therefore run interleaved (or across concurrent async flows)
with zero cross-talk: each call only advances _its own_ stream. Injection is the
first-class path — a flow that must not perturb another simply holds its own
instance (or snapshots with `getState()`/`setState()`).

## `sohl.random`: the shared singleton

`sohl.random` is one process-wide `Rng`, entropy-seeded at system construction
(so it is present as its own readiness signal). It is the **ambient** generator
for macros, the app, and e2e, and the **default-injected** source for
{@link sohl.entity.roll.SimpleRoll}, hit-location selection, and `rand()`.

It is one **shared** stream: safe for atomic synchronous draws, but _not_
isolated. Consumers never hardcode it — they take an optional `Rng` and fall back
to it only when none is passed:

```ts
roll.roll(); // draws from sohl.random
roll.roll(createRng("my-seed")); // draws from an isolated, reproducible stream
```

### Guardrail: never seed a play path

Production seeds `sohl.random` from `crypto.getRandomValues` and **never** accepts
a caller-supplied fixed seed through a play path. Predictable dice ruin play, and
because Foundry rolls client-side, a shared deterministic stream desyncs across
clients anyway (each advances it a different number of times). **Fixed seeds are
strictly a test/e2e affordance.**

## Determinism in tests

Two seams, by environment:

- **Targeted, single roll (`SimpleRoll.forceValues`)** — the #598 forced-value
  queue seeds exact die values (`forceValues(5, 100)`) that
  {@link sohl.entity.roll.SimpleRoll} consumes before touching any `Rng`. Best
  when a specific value must flip a specific outcome. It **takes precedence** over
  the injected generator.
- **Whole-stream reproducibility (seed an `Rng`)** — inject a per-test instance
  (`createRng("test-name")`) for isolated, order-independent streams in vitest; in
  Cypress, re-seed the singleton through the window
  (`win.sohl.random.seed("suite-01")`) since you cannot inject there.

```ts
// vitest — inject an isolated, reproducible stream:
const rng = createRng("hit-location-01");
const loc = body.getRandomLocation({ targetPart, spread: 100 }, rng);

// cypress — re-seed the singleton before the RNG-gated action:
cy.window().then((win) => win.sohl.random.seed("hit-location-suite-01"));
```

See `tests/domain/random/Rng.test.ts`, `tests/domain/body/BodyStructure.test.ts`,
and `cypress/e2e/seedable-random.cy.js` for worked examples, and the
[Testing](../how-to/testing.md) guide for the dice-determinism levels.
