# Writing Guided Tours

> **Audience:** SoHL contributors adding an in-app guided **Tour** — an
> interactive, in-context walkthrough that teaches a workflow (Character
> Creation, combat setup, …) on the live sheets rather than in prose.

SoHL tours are built on {@link sohl.apps.foundry.SohlTour}, a subclass of
Foundry's NUE `Tour`. A stock Foundry tour is a static JSON list of steps that can
only highlight elements already on screen and advance on **Next**. `SohlTour` adds
the three things every substantive SoHL tour needs:

1. **Scene-setting navigation** — open an Actor/Item sheet and switch to a named
   tab, awaiting each render, so a step can point at something on a not-yet-open
   tab.
2. **Gated steps** — keep **Next** disabled until the user has done something: a
   **value gate** waits for a control to hold a value; an **action/state gate**
   waits for a predicate over document/DOM state.
3. **Re-render survival** — when the watched sheet re-renders, the highlight
   re-anchors to the fresh element instead of pointing at a detached node.

**PRIME DIRECTIVE.** A tour **coaches and waits** — it highlights and instructs,
and only ever automates _scene-setting_ (opening a sheet, switching a tab). It
**never makes the user's meaningful choices for them**. Gated steps exist so the
tour can _wait for the human to act_, not act on their behalf. See
[Action Cards & the Consent Model](../concepts/action-cards.md).

## The three step kinds

Every step is one of {@link sohl.entity.tour.TOUR_STEP_KIND}:

| Kind         | Behaviour                                                           | Declare with                                    |
| ------------ | ------------------------------------------------------------------- | ----------------------------------------------- |
| `free`       | Advances on **Next** regardless of what the user did.               | No `gate` (the default).                        |
| `value-gate` | **Next** disabled until a target control holds the required value.  | `gate: TourGate.value(predicate)`               |
| `state-gate` | **Next** disabled until a predicate over document/DOM state passes. | `gate: TourGate.state(predicate)` + `readState` |

Use a **free** step where the value genuinely doesn't matter (the character's
name, an attribute value, description text). Use a **gate** only where the tour
must not move on until the user has actually done the thing the step teaches.

## The gate model (Foundry-free, unit-tested)

The _decision_ — "should Next be enabled?" — lives in the Foundry-free
{@link sohl.entity.tour} module and is unit-tested without a running Foundry
(`tests/domain/tour/`). A gate is a {@link sohl.entity.tour.TourGate}: a kind plus
a pure predicate `(ctx) => boolean`. `SohlTour` reads the live sheet to build the
`ctx`, then calls {@link sohl.entity.tour.isNextEnabled} — the class never decides
gating itself.

- **Value gate** — `ctx.value` is the current value of the step's watched control
  (its `control` selector, or the step `selector` if `control` is omitted).
  Ready-made predicates live in {@link sohl.entity.tour.gateValue}
  (`equals`, `oneOf`, `matches`, `nonEmpty`, `truthy`); compose your own for
  anything else.
- **State gate** — `ctx.state` is whatever your step's `readState(tour)` returns.
  Because that reader touches Foundry (documents, the open sheet), it lives on the
  step (`readState`), _outside_ the pure gate — keeping the predicate testable.

A gate **fails closed**: a predicate that throws (or returns a non-boolean) keeps
**Next** disabled, so a buggy gate never lets the user slip past.

## Navigation

A step navigates before it is shown by declaring either:

- `nav: { uuid, tab, group }` — open the document at `uuid`, switch to `data-tab`
  `tab` in group `group` (defaults to the sheet's primary group), awaiting each
  render; or
- `resolveDocument: (tour) => doc` — when the target isn't known ahead of time
  (e.g. "the actor the user is building"), resolve it dynamically. The tab still
  comes from `nav`.

`SohlTour` scopes a step's `selector` to the opened sheet, so the same selector
resolves correctly even with several sheets open, and it polls briefly for the
target to appear after a post-navigation render.

## Selector & timing guidance

- **Prefer stable selectors.** Target `[data-tab]`, `[data-action]`, and
  `name="…"` attributes over generated classes or nth-child positions.
- **Gate non-destructively where you can.** A value gate on a transient control
  (a search field) or an action gate on a navigation the user performs (clicking a
  tab) teaches without changing the character's data.
- **The framework waits; it doesn't click.** Don't try to satisfy a gate from the
  tour — the point of a gate is to wait for the human.
- **Re-renders are handled for you.** You don't need to re-declare a step after a
  sheet re-render; the highlight re-anchors automatically.

## A worked example

`src/apps/foundry/tours/framework-demo-tour.ts` is a small, registered tour that
exercises the whole framework against a Being sheet — a free intro, sheet
navigation, a value gate (a search field), an action gate (the user switches to
the Combat tab), and a free wrap-up. Read it alongside this guide; it is the
template a new tour is written from. The e2e spec
`cypress/e2e/guided-tours.cy.js` drives it end to end.

Its shape, condensed:

```ts
const config: SohlTourConfig = {
    namespace: "sohl",
    id: "my-tour",
    title: "SOHL.Tour.MyTour.title",
    display: true, // list it in Tour Management
    canStart: () => Boolean(firstOwnedBeing()), // eligibility
    steps: [
        // Free — centered intro.
        { id: "intro", title: "…", content: "…" },
        // Navigation + value gate — switch to Skills, wait for the search box.
        {
            id: "search",
            title: "…",
            content: "…",
            selector: 'input[name="search-skills"]',
            resolveDocument: () => firstOwnedBeing(),
            nav: { tab: "skills", group: "primary" },
            gate: TourGate.value(gateValue.nonEmpty()),
        },
        // Action gate — wait until the user opens the Combat tab themselves.
        {
            id: "combat",
            title: "…",
            content: "…",
            selector: '[data-action="tab"][data-tab="combat"]',
            resolveDocument: () => firstOwnedBeing(),
            gate: TourGate.state((ctx) => ctx.state === "combat"),
            readState: () => firstOwnedBeing()?.sheet?.tabGroups?.primary,
        },
    ],
};
return new SohlTour(config);
```

## Driven (railroaded) tours

Everything above is **coach-and-wait**: the tour highlights, waits, and only ever
automates scene-setting. A handful of tours — the **Automated Combat** tour above
all — are a different animal: they are opinionated and _railroaded_, so they must
**drive** the app down a fixed path and make dice **deterministic** so the scripted
rolls come out the same every run.

These are heavier, reusable capabilities kept deliberately separate from the
coach-and-wait core (#613 vs. #624). Reach for them **only** for a tour whose
explicit job is to demonstrate an automated workflow end to end — never to nudge a
coaching tour past a choice the human should make. The PRIME DIRECTIVE still holds:
a driven tour is sanctioned because _demonstrating the automation_ is its whole
point, not because driving is ever the default.

### Drive steps

A step may **perform** actions before it is shown by declaring a `drive` array.
Each action is executed and fully awaited in order, so the next action — and the
step's own `selector` — sees the world state the prior one produced. Drive actions
run **before** the step's `nav`, so navigation can target a document a drive
created (e.g. an actor from an imported adventure).

The drive vocabulary is {@link sohl.entity.tour.TOUR_DRIVE_KIND}:

| Kind               | Does                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| `import-adventure` | Import an Adventure document (by `uuid`) into the world.               |
| `activate-scene`   | Activate a Scene (by `uuid`) and await its canvas render.              |
| `start-combat`     | Start a Combat over `tokenUuids` (or all scene tokens); optional init. |
| `roll-initiative`  | Roll initiative for every combatant in the active combat.              |
| `advance-turn`     | Advance the active combat to the next turn.                            |
| `set-target`       | Set the current user's target to a token (by `tokenUuid`).             |
| `clear-target`     | Clear the current user's targeted tokens.                              |

```ts
{
    id: "engage",
    title: "…",
    content: "…",
    drive: [
        { kind: "activate-scene", uuid: "Scene.xxxx" },
        { kind: "start-combat", tokenUuids: ["Scene.xxxx.Token.aaaa", "Scene.xxxx.Token.bbbb"], rollInitiative: true },
        { kind: "set-target", tokenUuid: "Scene.xxxx.Token.bbbb" },
    ],
}
```

The **sequencing/await** logic ({@link sohl.entity.tour.runDrive}) is Foundry-free
and unit-tested (`tests/domain/tour/TourDrive.test.ts`); `SohlTour` supplies the
Foundry-coupled executor. A drive action that throws **halts the sequence** and
propagates — and the seeded-RNG teardown below still fires, because the error
unwinds through the tour's exit path.

### Seeded RNG — and its one hard teardown obligation

Set {@link sohl.apps.foundry.SohlTourConfig.seedRng} to run the tour in
**seeded-RNG mode**: {@link sohl.random} is seeded at tour start so its scripted
rolls are reproducible across runs.

```ts
const config: SohlTourConfig = {
    namespace: "sohl",
    id: "automated-combat",
    seedRng: "automated-combat-tour", // reproducible dice for the duration
    steps: [
        /* … drive steps … */
    ],
};
```

> ⚠️ **The seeded RNG MUST be restored on every exit path, and this is the tour's
> only teardown obligation.** `sohl.random` is the process-wide shared stream; a
> seed left in place makes the **user's real game return identical dice until they
> reload**. The restore is registered at seed time as a fire-once
> {@link sohl.entity.tour.RngLease} (a `finally`-style hook) so it cannot be
> skipped, and `SohlTour` invokes it from **all** of: normal completion, user
> abort, the Escape keybinding, navigation away (a `pagehide` safety net), and a
> mid-step error. The lease's `restore()` is idempotent, so those redundant hooks
> are safe. If you extend the framework, never add an exit path that bypasses
> {@link sohl.apps.foundry.SohlTour}'s `exit`/`progress`/`pagehide` teardown.

Because `restore()` rewinds `sohl.random` to its **exact pre-tour stream
position** (not a fresh entropy seed), the game continues the stream it would have
produced had the tour never run — there is no observable perturbation once the tour
ends. The seed/restore mechanics are Foundry-free and unit-tested
(`tests/domain/tour/TourRng.test.ts`); the all-exit-paths guarantee is proven by
the exit-path matrix in `cypress/e2e/guided-tours-drive.cy.js`.

## Registering a tour

Register from the system `ready` hook in
[`registerSystemTours`](../../src/apps/foundry/tours/register-tours.ts) so the tour
appears in **Tour Management** (`display: true`) and can be launched from there:

```ts
game.tours.register("sohl", "my-tour", buildMyTour());
```

Localization keys (`title` / `description` / each step's `title` / `content`) go in
`lang/en.json` under `SOHL.Tour.*`; `content` may contain HTML. Never rename an
existing key — add new ones.

## See also

- {@link sohl.apps.foundry.SohlTour} — the base class and its lifecycle overrides.
- {@link sohl.entity.tour} — the Foundry-free gate model.
- [Testing](./testing.md) — the unit + Cypress suites the framework is verified with.
- [System Development](../contributing/system-development.md) — the contribution workflow.
