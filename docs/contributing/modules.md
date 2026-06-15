# Writing Modules for SoHL

_How to build a Foundry VTT **module** that integrates with or extends Song of
Heroic Lands (SoHL) without modifying the system itself._

A module is the right vehicle for complex house rules, added content and
automation, alternate rulesets, and re-skins — anything you want to ship and
toggle independently of the core system.

The guiding principle is the same one the system holds itself to: **extend, don't
fork.** SoHL exposes hooks, registries, a public runtime object, and CSS variables
precisely so a module can layer on top. Editing system source is not an
integration strategy — when the system updates, your changes are lost and your
users' worlds are at risk.

## How a module attaches to SoHL

SoHL is a Foundry **system** with id `sohl` (see `system.json`), requiring Foundry
**v14+**. A module targeting it declares that relationship in its own
`module.json`, so Foundry knows the module is meant to run under SoHL:

```json
{
    "id": "my-sohl-module",
    "title": "My SoHL Module",
    "compatibility": {
        "minimum": "14"
    },
    "relationships": {
        "systems": [
            {
                "id": "sohl",
                "type": "system",
                "manifest": "https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/releases/latest/download/system.json",
                "compatibility": {
                    "minimum": "0.7.0"
                }
            }
        ]
    },
    "esmodules": ["scripts/my-module.js"]
}
```

(See Foundry's module-development documentation for the full manifest schema.)
Your module's entry script then hooks into the system at runtime, as below.

## Reaching the SoHL API

A module reaches SoHL through the same two surfaces any script uses — the global
`sohl` object (system-wide services and helpers) and each document's `.logic`
(per-document state and actions). See **[The SoHL API](../how-to/sohl-api.md)**
for both surfaces and the `SohlSystem` member reference. For **type-safe** module
development, the public class and type surface is published in
`types/sohl-public-api.d.ts`; import those types with `import type` for editor
autocompletion.

> The reachable public API is still being formalized (epic
> [#80](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/80)).
> Treat the canonical how-to references below as the source of truth for exact
> registration calls, and prefer hooks for behavior you want to be stable.

## Extension mechanisms

SoHL supports all of the standard hooks provided by Foundry VTT.
In addition to these hooks, SoHL also supports a number of other hooks that
can be used to integrate with the system.

### Lifecycle hooks — cross document behavior

When a document is processed by SoHL, it goes through various lifecycle methods.
Hooks have been developed to allow you to add your own processing at these
critical points. This allows you to add or alter the behavior of skills, gear,
or other items uniformly across all documents. See [Lifecycle Hooks](../how-to/lifecycle-hooks.md)
for the full hook reference, the arguments each receives, and the recommended
**module guard pattern** (a world setting toggle plus a GM guard) so your module
is opt-in and side-effect-safe.

### Registries — domains and calendars

The system keeps registries a module can add to during `init`, including the
**domain** registry (`SohlDomains`) and the **calendar** registry. The exact
registration calls live in [Extension Points](../how-to/extension-points.md) (§7
System registries, §8 Calendar registration) — follow that document so your code
matches the maintained API.

### New types, sheets, effects, and chat cards

Adding a new actor/item type or sheet follows the system's layering pattern
(Document → DataModel → Logic → Sheet). [Extension Points](../how-to/extension-points.md)
walks through registering new types, active-effect integration, and UI/chat-card
templates. Read [Architecture Overview](../concepts/architecture.md) first for the
three-layer model and the Foundry-free logic boundary your additions must respect.

### Re-skins and theming

A module can restyle the system purely through CSS by overriding the `--sohl-*`
custom properties — no markup changes. See
[CSS Architecture & Styleguide](../concepts/css-architecture.md).

## Boundaries

- **Don't modify system source** to achieve integration — use the seams above.
- **Respect backwards compatibility and the data model.** A module must not rename
  or reshape system data fields; if it stores its own data, namespace it under your
  module id (e.g. via flags).
- **Keep the logic boundary in mind.** The system's game rules live in a
  Foundry-free logic layer; mirror that separation in your own module where it
  helps testability.

For the standards your contributions to the core system must meet (as opposed to a
standalone module), see the [Contributing guide](./contributing.md).
