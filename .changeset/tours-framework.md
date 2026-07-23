---
"sohl": minor
---

**Guided-tour framework (`SohlTour`)**

Add the reusable in-app guided-tour framework that the SoHL Guided Tours epic
builds on. A stock Foundry tour can only highlight what's already on screen and
advance on **Next**; `SohlTour` (a subclass of Foundry's NUE `Tour`) adds the
machinery every substantive SoHL tour needs, extracted once:

- **Three step kinds** — a **free** step (advances on Next), a **value-gate** step
  (**Next** stays disabled until a target control holds a value), and an
  **action/state-gate** step (**Next** stays disabled until a predicate over
  document/DOM state passes). The disable-Next _decision_ is the Foundry-free
  {@link sohl.entity.tour} gate model — `TourGate`, `gateValue` predicate helpers,
  and `isNextEnabled` — written test-first and unit-tested without a running
  Foundry.
- **Scene-setting navigation** — a step can open an Actor/Item sheet and switch to
  a named tab, awaiting each render, so a selector on a not-yet-open tab resolves
  after navigation. Only navigation is automated; the user's meaningful choices are
  never made for them (PRIME DIRECTIVE — a tour coaches and waits).
- **Re-render survival** — when the watched sheet re-renders, the highlight
  re-anchors to the fresh target element.
- **Registration + a worked example** — `registerSystemTours` wires tours into
  **Tour Management**; a small self-contained demo tour exercises all three step
  kinds against a Being sheet and doubles as the authoring reference. New
  `SOHL.Tour.*` localization keys and a
  [Writing Guided Tours](../docs/how-to/guided-tours.md) authoring guide are added.

Closes #613
