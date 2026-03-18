# System Class Overrides (SohlSystem Extension)

> **Audience:** Module and variant developers who need to replace SoHL's core classes — modifier types, result types, document sheets, or actor/item logic — at a system-wide level.

See also: [Lifecycle Hooks](./lifecycle-hooks.md), [Creating a Variant Module](./variant-module.md), [Extension Points](./extension-points.md), [Runtime Contracts](../reference/runtime-contracts.md).

**You are here**

- This page covers how to extend `SohlSystem` to override classes that SoHL uses at runtime.
- For narrow per-item overrides, use [Action Items](./actions.md).
- For lifecycle augmentation without new classes, use [Lifecycle Hooks](./lifecycle-hooks.md).
- For a complete walkthrough of creating a variant, see [Creating a Variant Module](./variant-module.md).

## What is SohlSystem?

`SohlSystem` (`src/core/SohlSystem.ts`) is the central class that:

- Holds the runtime configuration (`CONFIG`) for document classes, data models, sheets, and result/modifier constructors.
- Owns the variant registry (maps variant IDs to `SohlSystem` instances).
- Owns the calendar registry.
- Provides the `sohl` global accessor used by all runtime code to resolve variant-appropriate classes.

At startup, one variant is selected and its `SohlSystem` instance is assigned to `globalThis.sohl`. All runtime code constructs variant-specific objects through `sohl.CONFIG` rather than hard-coding class names.

## The CONFIG object

`SohlSystem.CONFIG` is a static getter returning a Foundry-compatible `CONFIG` object. It defines which classes are active at runtime:

### Modifier classes

| CONFIG key | Default class | Description |
|------------|---------------|-------------|
| `CONFIG.ValueModifier` | `ValueModifier` | Base auditable value tracker |
| `CONFIG.CombatModifier` | `CombatModifier` | Combat-specific modifier |
| `CONFIG.ImpactModifier` | `ImpactModifier` | Damage/impact modifier |
| `CONFIG.MasteryLevelModifier` | `MasteryLevelModifier` | Test mastery level modifier |

### Result classes

| CONFIG key | Default class | Description |
|------------|---------------|-------------|
| `CONFIG.SuccessTestResult` | `SuccessTestResult` | Single test result |
| `CONFIG.OpposedTestResult` | `OpposedTestResult` | Opposed test result |
| `CONFIG.ImpactResult` | `ImpactResult` | Impact/damage result |
| `CONFIG.AttackResult` | `AttackResult` | Attack resolution |
| `CONFIG.DefendResult` | `DefendResult` | Defense resolution |
| `CONFIG.CombatResult` | `CombatResult` | Full combat outcome |

### Document sheets

`CONFIG.Actor.documentSheets` and `CONFIG.Item.documentSheets` map actor/item type strings to sheet classes. Overriding these replaces the sheet for that document type.

## Accessing CONFIG at runtime

All code that needs a variant-resolved class should go through the `sohl` global:

```typescript
// Construct a modifier using the active variant's class
const mod = new sohl.modifier.Value({}, { parent: this });
const combat = new sohl.modifier.Combat({}, { parent: this });

// Construct a result
const result = new sohl.result.SuccessTest({}, { parent: this });

// Access modifier constants
const MOD = sohl.mod; // variant-specific modifier constant table
```

This ensures that common code stays variant-agnostic.

## Extending SohlSystem

To override classes, extend `SohlSystem` and override `static get CONFIG()`:

```typescript
import { SohlSystem } from "@src/core/SohlSystem";
import { MyCustomCombatModifier } from "./MyCustomCombatModifier";
import { MyCustomSuccessTestResult } from "./MyCustomSuccessTestResult";

export class MyVariantSystem extends SohlSystem {
    static override readonly ID = "myvariant";
    static override readonly TITLE = "My Variant";

    static override get CONFIG(): SohlSystem.Config {
        return foundry.utils.mergeObject(
            SohlSystem.CONFIG,
            {
                CombatModifier: MyCustomCombatModifier,
                SuccessTestResult: MyCustomSuccessTestResult,
            },
            { inplace: false },
        );
    }

    override setupSheets(): void {
        // Register custom sheets if needed
        // DocumentSheetConfig.registerSheet(Actor, "sohl", MyBeingSheet, {
        //     types: ["being"],
        //     makeDefault: true,
        // });
    }

    static getInstance(): MyVariantSystem {
        if (!this._instance) this._instance = new MyVariantSystem();
        return this._instance as MyVariantSystem;
    }
    private static _instance: MyVariantSystem | undefined;
}
```

### Required static overrides

| Property | Purpose |
|----------|---------|
| `static ID` | Unique variant identifier string (used in world settings) |
| `static TITLE` | Human-readable variant display name |

### setupSheets()

Override `setupSheets()` to register Foundry sheet classes for this variant:

```typescript
override setupSheets(): void {
    DocumentSheetConfig.registerSheet(Actor, "sohl", MyBeingSheet, {
        types: ["being"],
        label: "My Variant Being Sheet",
        makeDefault: true,
    });
    DocumentSheetConfig.registerSheet(Item, "sohl", MySkillSheet, {
        types: ["skill"],
        label: "My Variant Skill Sheet",
        makeDefault: true,
    });
}
```

`setupSheets()` is called by `SohlSystem.selectVariant()` during Foundry `init`, after `CONFIG` is merged into Foundry's global `CONFIG`.

## Registering a custom SohlSystem

Modules register their `SohlSystem` during the `sohl.registerVariants` hook, which fires during Foundry `init` after SoHL's built-in variants are registered:

```js
Hooks.once("sohl.registerVariants", () => {
    SohlSystem.registerVariant(
        MyVariantSystem.ID,
        MyVariantSystem.getInstance()
    );
});
```

Once registered, the variant appears in the world setting dropdown for `sohl.variant`. When selected, it becomes `globalThis.sohl` and its `CONFIG` is merged into Foundry's `CONFIG`.

## Accessing sohl at runtime

After variant selection, use `globalThis.sohl` to access the active system:

```typescript
// Type-narrow if you know your variant is active
const mySohl = globalThis.sohl as MyVariantSystem;

// Or use generic access — works with any variant
const result = new sohl.result.SuccessTest(data, options);
```

## What you can and cannot override

| Can override | Cannot / should not override |
|-------------|------------------------------|
| Modifier classes | DataModel schema fields (breaks data portability) |
| Result classes | Lifecycle phase order |
| Document sheets | Hook names (other modules depend on them) |
| Logic classes (via sheet registration + data model `__kind`) | `ACTOR_KIND` / `ITEM_KIND` constants |
| Calendar data model | Core SohlActor/SohlItem document class internals |

**Data model invariant:** DataModel schemas are shared and variant-agnostic. Variants should not add variant-specific persisted fields to shared schemas. Store variant-specific data under `flags.sohl.<variantId>.*` and provide safe defaults when those flags are missing.

## Worked example: replacing the combat modifier

Goal: replace `CombatModifier` with a subclass that adds a new modifier operation.

```typescript
// my-module/MyCombatModifier.ts
import { CombatModifier } from "@src/modifier/CombatModifier";

export class MyCombatModifier extends CombatModifier {
    addMorale(label: string, value: number): this {
        return this.add(`morale.${label}`, value);
    }
}

// my-module/MySystem.ts
import { SohlSystem } from "@src/core/SohlSystem";
import { MyCombatModifier } from "./MyCombatModifier";

export class MySystem extends SohlSystem {
    static override readonly ID = "mysystem";
    static override readonly TITLE = "My System";

    static override get CONFIG(): SohlSystem.Config {
        return foundry.utils.mergeObject(
            SohlSystem.CONFIG,
            { CombatModifier: MyCombatModifier },
            { inplace: false },
        );
    }

    static getInstance(): MySystem { /* singleton */ }
}

// At module init:
Hooks.once("sohl.registerVariants", () => {
    SohlSystem.registerVariant(MySystem.ID, MySystem.getInstance());
});
```

After selecting this variant, all code that calls `new sohl.modifier.Combat(...)` will get a `MyCombatModifier` instance.
