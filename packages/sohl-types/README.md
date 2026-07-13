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

> **Status:** `0.0.x` is a bootstrap placeholder. The full generated
> declarations — the Logic/Data interfaces and the `sohl.*` namespace tree — land
> in a later release. See the SoHL repository for progress.

## License

GPL-3.0-or-later — see the [SoHL repository](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT).
