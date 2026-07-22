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
