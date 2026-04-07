# Creating a Variant Module

> **Audience:** Developers implementing a full alternative rule family for SoHL.
>
> **This is an advanced developer topic.** Creating a variant requires TypeScript development, Foundry module packaging, and deep familiarity with SoHL internals. Most customization goals — including complex house rules — are better served by [Action Items](./actions.md) (no code required) or [Lifecycle Hooks](./lifecycle-hooks.md) (a small module). Only pursue a full variant if you need a coherent parallel rule family.

See also: [System Class Overrides](./system-class-overrides.md), [Lifecycle Hooks](./lifecycle-hooks.md), [Rules Variants and Extension Mechanisms](../concepts/rules-variants.md), [Runtime Contracts](../reference/runtime-contracts.md).

**You are here**

- This page is a step-by-step guide for creating a Foundry VTT module that registers a new SoHL variant.
- Variants are the right mechanism for **coherent alternative rule families** (e.g., a new edition of HârnMaster, a different magic system). If you only need to change behavior for specific items or document types, use [Action Items](./actions.md) or [Lifecycle Hooks](./lifecycle-hooks.md) instead.
- For class-level override details (CONFIG, SohlSystem), see [System Class Overrides](./system-class-overrides.md).

## When to use a variant

A variant is appropriate when:

- You need many interacting mechanics to change together coherently.
- You are implementing rules that affect most actors and items, not just a few types.
- Your changes require new data model logic, custom modifier/result classes, or new sheet classes.

A variant is **not** appropriate when:

- You want to change one specific spell or skill (use [Action Items](./actions.md)).
- You want to apply house rules to all items of a type (use [Lifecycle Hooks](./lifecycle-hooks.md)).
- You only need to replace a single class (see [System Class Overrides](./system-class-overrides.md) — a full variant may not be necessary).

## Overview

A SoHL variant module is a standard Foundry VTT module that:

1. Declares itself as a Foundry module (via `module.json`).
2. Contains a `SohlSystem` subclass that overrides `CONFIG` and `setupSheets()`.
3. Registers its system via `SohlSystem.registerVariant()` during the `sohl.registerVariants` hook.

Once registered and selected in the world settings, the variant's classes replace SoHL's defaults for all runtime dispatch.

## Step 1: Create the Foundry module structure

```
my-variant/
  module.json
  src/
    MyVariantSystem.ts
    logic/
      MyBeingLogic.ts
      ...
    modifier/
      MyCombatModifier.ts
      ...
    result/
      MySuccessTestResult.ts
      ...
  templates/
    being-sheet.html
    ...
  lang/
    en.json
```

### module.json

```json
{
  "id": "my-variant",
  "title": "My Variant",
  "description": "An alternative rule family for SoHL.",
  "version": "1.0.0",
  "compatibility": {
    "minimum": "14.356"
  },
  "relationships": {
    "systems": [
      {
        "id": "sohl",
        "type": "system",
        "compatibility": { "minimum": "2.0.0" }
      }
    ]
  },
  "esmodules": ["my-variant.js"],
  "languages": [
    {
      "lang": "en",
      "name": "English",
      "path": "lang/en.json"
    }
  ]
}
```

The `relationships.systems` entry declares that this module requires SoHL. Foundry will warn the user if SoHL is not active.

## Step 2: Implement override classes

Override only the classes where your rules differ. Start with just what is different — you can always extend later.

### Subclassing a logic class

Logic classes live in `src/document/*/logic/`. To override Being logic:

```typescript
// src/logic/MyBeingLogic.ts
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { BeingData } from "@src/document/actor/logic/BeingLogic";

export class MyBeingLogic extends BeingLogic {
    override evaluate(): void {
        super.evaluate();
        // Add variant-specific evaluation here
    }
}
```

### Subclassing a modifier class

```typescript
// src/domain/modifier/MyCombatModifier.ts
import { CombatModifier } from "@src/domain/modifier/CombatModifier";

export class MyCombatModifier extends CombatModifier {
    // Override or extend as needed
}
```

### Subclassing a result class

```typescript
// src/domain/result/MySuccessTestResult.ts
import { SuccessTestResult } from "@src/domain/result/SuccessTestResult";

export class MySuccessTestResult extends SuccessTestResult {
    // Override evaluate(), toChat(), etc.
}
```

## Step 3: Implement MyVariantSystem

```typescript
// src/MyVariantSystem.ts
import { SohlSystem } from "@src/core/SohlSystem";
import { MyCombatModifier } from "./modifier/MyCombatModifier";
import { MySuccessTestResult } from "./result/MySuccessTestResult";

export class MyVariantSystem extends SohlSystem {
    static override readonly ID = "my-variant";
    static override readonly TITLE = "My Variant";

    private static _instance: MyVariantSystem | undefined;

    static getInstance(): MyVariantSystem {
        if (!this._instance) this._instance = new MyVariantSystem();
        return this._instance as MyVariantSystem;
    }

    static override get CONFIG(): SohlSystem.Config {
        return foundry.utils.mergeObject(
            SohlSystem.CONFIG,
            {
                CombatModifier: MyCombatModifier,
                SuccessTestResult: MySuccessTestResult,
                // Override other classes here
            },
            { inplace: false },
        );
    }

    override setupSheets(): void {
        // Register your custom sheets
        // DocumentSheetConfig.registerSheet(Actor, "sohl", MyBeingSheet, {
        //     types: ["being"],
        //     label: "My Variant Being Sheet",
        //     makeDefault: true,
        // });
    }
}
```

**Important:** Always use `foundry.utils.mergeObject(..., { inplace: false })` when building CONFIG, not direct object spread. This ensures the base system's CONFIG is not mutated.

## Step 4: Register logic class overrides

For logic class overrides that replace which Logic class an item type uses, register them in the variant's constructor or in `setupSheets()` by updating the appropriate `SohlSystem` registry maps. Consult `src/core/SohlSystem.ts` for the `COMMON_ACTOR_LOGIC` and `COMMON_ITEM_LOGIC` map structures.

For actor logic overrides (e.g., replacing `BeingLogic` with `MyBeingLogic`):

```typescript
override setupSheets(): void {
    super.setupSheets();

    // Replace Being logic class for this variant
    // (exact API depends on current SohlSystem implementation)
    this.actorLogicRegistry.set("being", MyBeingLogic);
}
```

## Step 5: Register the variant at init

```typescript
// Entry point (loaded via esmodules in module.json)
import { MyVariantSystem } from "./MyVariantSystem";

Hooks.once("sohl.registerVariants", () => {
    SohlSystem.registerVariant(
        MyVariantSystem.ID,
        MyVariantSystem.getInstance()
    );
});
```

The `sohl.registerVariants` hook fires during Foundry's `init` after SoHL's built-in variants register. This guarantees your variant is available before the world-setting lookup activates the selected variant.

## Step 6: Select the variant in world settings

Once the module is installed and enabled, the variant appears in **Game Settings → Configure System Settings → Active Variant**. Select your variant's ID. The world must be reloaded for the selection to take effect.

## Variant data portability

Variants share the same base DataModel schemas. This means:

- Data created in one variant can be loaded in another without schema errors.
- Your variant **must not** add persisted fields to shared DataModel schemas.
- Store all variant-specific persisted state under `flags.sohl.my-variant.*`.
- Logic must provide safe defaults when those flags are absent (for cross-variant imports).

```typescript
// Example: reading variant-specific flag safely
const myFlag = item.getFlag("sohl", "my-variant.myField") ?? defaultValue;
```

## Testing the variant

- Load a world with your variant selected.
- Confirm `globalThis.sohl instanceof MyVariantSystem` is true.
- Confirm `sohl.modifier.Combat` returns `MyCombatModifier`.
- Run `npm run test` to ensure no base test regressions — variant logic in separate files should not break base tests.
- Write variant-specific tests in `tests/` mirroring your module's source structure.

## Reference

| File | Purpose |
|------|---------|
| `src/core/SohlSystem.ts` | Base class to extend |
| `src/core/LegendarySystem.ts` | Reference implementation of a SohlSystem subclass |
| `src/sohl.ts` | Shows startup sequence and registerVariants call |
| `src/domain/modifier/` | Modifier base classes to subclass |
| `src/domain/result/` | Result base classes to subclass |
| `src/document/*/logic/` | Logic base classes to subclass |
