![Song of Heroic Lands](../assets/ui/sohl-background.webp)

# Song of Heroic Lands — API Reference

The developer reference for the **Song of Heroic Lands (SoHL)** Foundry VTT
system, generated from the source with TypeDoc. It is intended for developers
**building against or extending** SoHL and contributors working on the system
itself.

> Looking for how to _play_? Player- and GM-facing rules, the quickstart, and
> character creation live on the project site:
> [heroiclands.org](https://heroiclands.org/projects/sohl/). This reference does
> not duplicate them.

## Where to start

- **[Architecture Overview](concepts/architecture.md)** — the mental model and a
  map of the `src/` tree. Read this first.
- **[Getting Started](how-to/getting-started.md)** — environment setup, a tour
  of the codebase, and your first change.
- **The sidebar** — every public class, function, and type, grouped to mirror
  the source (see below).

## How this reference is organized

The navigation on the left mirrors the `src/` layout, so a folder in the source
maps directly to a group here:

- **Core** — Foundry-layer foundations (system registration, data-model and
  logic bases, the `FoundryHelpers` shim, calendar, event queue).
- **Documents** — Foundry document classes by kind: **Actor**, **Item**,
  **Combat**, **Combatant**, **Chat**, **Effect**, **Scene**, **Token**.
- **Domain** — pure, Foundry-free game-mechanics objects: **Modifier**,
  **Result**, **Body**, **Action**, **Movement**, **StrikeMode**, **SkillBase**.
- **Utility** — shared helpers: **Constants**, **Helpers**, **Collection**,
  **AI**.
- **Applications** — standalone Foundry application windows.

## Guides

The full guide set is in the sidebar under **[Documentation](documentation.md)**,
grouped into four sections (the individual pages are listed there, so this page
does not duplicate them):

- **[Concepts](concepts/concepts.md)** — the mental model, the API surfaces,
  actions, expressions/scripts, the security model, and CSS architecture.
- **[How-to](how-to/how-to.md)** — setup, extension points, lifecycle hooks,
  house rules, testing, and build/deployment.
- **[Reference](reference/reference.md)** — contracts and catalogs: types, the
  modifier model, combat pipeline, body structure, effects, runtime contracts,
  scene/token/combatant, calendar, and the event queue.
- **[Contributing](contributing/contributing.md)** — how to contribute:
  standards, the development workflow, modules, changesets, and docs hosting.

---

SoHL is licensed under GPL-3.0-or-later (code) and CC-BY-SA-4.0 (content). Source
on [GitHub](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT).
