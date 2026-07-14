![Song of Heroic Lands](../assets/ui/sohl-background.webp)

# Song of Heroic Lands — API Reference

The developer reference for the **Song of Heroic Lands (SoHL)** Foundry VTT
system, generated from the source with TypeDoc — every exported class, function,
and type. It is intended for developers **building against or extending** SoHL
and contributors working on the system itself.

> Looking for **guides** — architecture, how-tos, concepts, contributing? Those
> live in the **[Knowledgebase](https://kb.heroiclands.org)**, alongside the
> player-facing content reference. This site is the generated symbol reference
> only.

> Looking for how to _play_? Player- and GM-facing rules, the quickstart, and
> character creation live on the project site:
> [heroiclands.org](https://heroiclands.org/projects/sohl/).

## Where to start

- **The sidebar** — every public class, function, and type, grouped to mirror
  the `sohl.*` namespace tree (see below).
- **[Architecture Overview](https://kb.heroiclands.org/concepts/architecture/)**
  (Knowledgebase) — the mental model and a map of the `src/` tree. Read this first.
- **[Getting Started](https://kb.heroiclands.org/how-to/getting-started/)**
  (Knowledgebase) — environment setup, a codebase tour, and your first change.

## How this reference is organized

The navigation on the left mirrors the `sohl.*` namespace tree, so a symbol's
documentation path equals its location in the source and on the runtime global
(for example `sohl.document.actor.logic.BeingLogic`):

- **`sohl.core`** — Foundry-layer foundations: system registration, the
  data-model and logic bases, the `FoundryHelpers` shim, calendar, event queue.
- **`sohl.document`** — Foundry document types by kind (actor, item, combat,
  combatant, chat, effect, scene, token), each with its Foundry-free logic.
- **`sohl.entity`** — pure, Foundry-free game-mechanics objects: modifiers,
  results, body, actions, movement, strike modes, expressions.
- **`sohl.utils`** — shared utilities: constants, helpers, collections.
- **`sohl.apps`** — standalone Foundry application windows.

---

SoHL is licensed under GPL-3.0-or-later (code) and CC-BY-SA-4.0 (content). Source
on [GitHub](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT).
