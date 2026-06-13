# SoHL Developer & API Documentation

The entry point for working **on** the Song of Heroic Lands (SoHL) system — for developers extending the API, contributors changing core, and anyone who needs a mental model of the code.

This documentation is **developer- and API-facing only**. Player- and GM-facing rules and play guides are not duplicated here — they live on the project site (see [Player & GM rules](#player--gm-rules-external) below).

## Start here

1. [Architecture Overview](concepts/architecture.md) — the system's mental model and a map of the `src/` tree. **Read this first.**
2. [Getting Started](how-to/getting-started.md) — environment setup, codebase tour, and your first change.
3. [API Reference](https://api.heroiclands.org/latest) — generated TypeDoc, with a sidebar grouped to mirror the source: Core / Documents / Domain / Utility.

## Concepts

Design and rationale — how and why the system is built the way it is.

- [Architecture Overview](concepts/architecture.md)
- [Lifecycle Model](concepts/lifecycle-model.md)
- [Assembly Architecture](concepts/assembly-architecture.md)
- [CSS Architecture & Styleguide](concepts/css-architecture.md)

## How-to

Task-oriented guides for getting something done.

- [Getting Started (New Developer Guide)](how-to/getting-started.md)
- [Extension Points](how-to/extension-points.md)
- [Lifecycle Hooks](how-to/lifecycle-hooks.md)
- [Actions](how-to/actions.md)
- [House Rules Cookbook](how-to/house-rules-cookbook.md)
- [Testing](how-to/testing.md)

## Reference

Contracts, catalogs, and specifications.

- [Type Catalog](reference/type-catalog.md)
- [Modifier Model](reference/modifier-model.md)
- [Combat Resolution Pipeline](reference/combat-resolution-pipeline.md)
- [Body Structure](reference/body-structure.md)
- [Effects Integration](reference/effects-integration.md)
- [Runtime Contracts](reference/runtime-contracts.md)
- [Scene, Token, and Combatant Systems](reference/scene-token-combatant.md)
- [Calendar](reference/calendar.md)
- [Event Queue](reference/event-queue.md)

## Contributing

Maintainer and project-meta documentation.

- [API Docs Hosting (api.heroiclands.org)](contributing/api-docs-hosting.md)

## Player & GM rules (external)

Rules and play guides are maintained on the project site, not in this repo:

- [SoHL on heroiclands.org](https://heroiclands.org/projects/sohl/)
- [User Guide](https://heroiclands.org/sohl/user-guide/sohl-user-guide/)
- [Rules](https://heroiclands.org/sohl/user-guide/sohl-rules/)
- [Quickstart](https://heroiclands.org/sohl/user-guide/sohl-quickstart/)
- [Character Creation](https://heroiclands.org/sohl/user-guide/sohl-character-creation/)
