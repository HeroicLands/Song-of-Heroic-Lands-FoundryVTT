# @heroiclands/sohl-types

**Type declarations** for the [Song of Heroic Lands (SoHL)](https://heroiclands.org)
system for Foundry VTT — for authoring macros and variant/extension modules in
TypeScript.

This package is **types-only**. It declares no runtime values, and you never
import SoHL's runtime from it. Foundry loads the SoHL _system_, and your code
reaches every value through the live **`sohl`** global:

```ts
// dev-time: type for the annotation, from this package
import type { ValueModifier } from "@heroiclands/sohl-types";
// runtime: value from the global that Foundry loaded — never an import
const mod: ValueModifier = new sohl.entity.ValueModifier(data, { parent });
```

## Install

```
npm install -D @heroiclands/sohl-types
```

Reference it in your module's `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@heroiclands/sohl-types"]
  }
}
```

The declarations are **generated from the SoHL source** — the Logic/Data
interfaces, the domain class types, and the full `sohl.*` namespace tree
(`sohl.document.effect.foundry.SohlActiveEffect`, `sohl.entity.modifier.ValueModifier`,
…).

### Peer dependencies

Two packages supply types these declarations reference, so npm asks you to
install them alongside:

| Peer                       | Why                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `fvtt-types`               | Foundry's own globals — SoHL's document classes extend `Actor`, `Item`, `Scene`, and friends.                                    |
| `@codemirror/autocomplete` | The expression editor's completion source is part of the `sohl.apps.foundry.*` surface and is typed with CodeMirror's own types. |

You almost certainly have `fvtt-types` already if you write Foundry TypeScript.

## License

GPL-3.0-or-later — see the [SoHL repository](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT).
