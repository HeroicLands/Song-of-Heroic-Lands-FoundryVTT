# SoHL Developer & API Documentation

The entry point for working **on** the Song of Heroic Lands (SoHL) system — for developers extending the API, contributors changing core, and anyone who needs a mental model of the code.

This documentation is **developer- and API-facing only**. Player- and GM-facing rules and play guides are not duplicated here — they live on the project site (see [Player & GM rules](#player--gm-rules-external) below).

## Start here

1. [Architecture Overview](concepts/architecture.md) — the system's mental model and a map of the `src/` tree. **Read this first.**
2. [Getting Started](how-to/getting-started.md) — environment setup, codebase tour, and your first change.
3. [API Reference](https://api.heroiclands.org/latest) — generated TypeDoc, with a sidebar grouped to mirror the source: Core / Documents / Domain / Utility.

> **Security-critical change?** If you are touching serialization, HTML
> rendering, actions/executors, or chat/cross-client flows, read
> [Security Model & Guardrails](concepts/security-model.md) **first**. Its
> keystone rule — _data carries a **reference** to code (a `__kind` tag, a method
> name, a Macro UUID), never source; functions are never serialized_ — is the
> system's top security constraint.

## Concepts

Design and rationale — how and why the system is built the way it is.

- [Architecture Overview](concepts/architecture.md) — the mental model and a map of the `src/` tree. **Read this first.**
- [The SoHL API](concepts/sohl-api.md)
- [Combat Model](concepts/combat-model.md) — assisted vs. automated combat, and how the combat flow is wired programmatically (combatants, the exchange workflow, resolution).
- [Macros and Actions](concepts/macros-and-actions.md)
- [Expressions and Scripts](concepts/expressions.md) — the ways author-supplied logic runs: `SafeExpression`, Macros, and the Expression Library.
- [Security Model & Guardrails](concepts/security-model.md) — the threat model and the standing rules every change must respect. **Read before touching serialization, HTML rendering, actions, or cross-client flows.**
- [CSS Architecture & Styleguide](concepts/css-architecture.md)

## How-to

Task-oriented guides for getting something done.

- [Getting Started (New Developer Guide)](how-to/getting-started.md)
- [Extension Points](how-to/extension-points.md)
- [API Access Map](how-to/api-access-map.md)
- [Lifecycle Hooks](how-to/lifecycle-hooks.md)
- [House Rules Cookbook](how-to/house-rules-cookbook.md)
- [Testing](how-to/testing.md)
- [Build, Deployment, and Release](how-to/build-and-deployment.md)
- [Issue Reporting](how-to/issue-reporting.md) — how issues are typed, prioritized, labeled, and tied to capability milestones.

## Reference

Contracts, catalogs, and specifications.

- [Type Catalog](reference/type-catalog.md)
- [Modifier Model](reference/modifier-model.md)
- [Combat Resolution Pipeline](reference/combat-resolution-pipeline.md)
- [Result-description Tables](reference/result-description-tables.md)
- [Body Structure](reference/body-structure.md)
- [Effects Integration](reference/effects-integration.md)
- [Runtime Contracts](reference/runtime-contracts.md)
- [Scene, Token, and Combatant Systems](reference/scene-token-combatant.md)
- [Calendar](reference/calendar.md)
- [Event Queue](reference/event-queue.md)
- [Handlebars Template Helpers](reference/handlebars-helpers.md)

## Contributing

How to contribute: standards, the development workflow, and maintainer/project-meta.

- [System Development](contributing/system-development.md) — standards, the rules of development, and how to submit a change.
- [Writing Modules](contributing/module-development.md) — build a Foundry module that extends SoHL without forking.
- [Writing Changesets](contributing/writing-changesets.md) — record a change for the changelog and release notes.
- [API Docs Hosting (api.heroiclands.org)](contributing/api-docs-hosting.md)

## Player & GM rules (external)

Rules and play guides are maintained on the project site, not in this repo:

- [SoHL on heroiclands.org](https://heroiclands.org/projects/sohl/)
- [User Guide](https://heroiclands.org/sohl/user-guide/sohl-user-guide/)
- [Rules](https://heroiclands.org/sohl/user-guide/sohl-rules/)
- [Quickstart](https://heroiclands.org/sohl/user-guide/sohl-quickstart/)
- [Character Creation](https://heroiclands.org/sohl/user-guide/sohl-character-creation/)
