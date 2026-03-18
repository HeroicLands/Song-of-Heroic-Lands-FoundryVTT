# Action Items (Per-Actor and Per-Item Logic)

> **Audience:** Developers implementing new action types or working with the Action API. For user-facing documentation on creating and using Actions, see the in-game user guide entry **Actions** (journal: User Guide → Actions).

See also: [Lifecycle Hooks](./lifecycle-hooks.md), [Extension Points](./extension-points.md), [Rules Variants](../concepts/rules-variants.md), [House Rules Cookbook](./house-rules-cookbook.md).

**You are here**

- This page covers **Action items**: document-attached executable logic tightly bound to a specific Actor or Item.
- For broad type-level logic that runs across all items of a type, use [Lifecycle Hooks](./lifecycle-hooks.md) instead.
- For full rule-family overrides, see [System Class Overrides](./system-class-overrides.md) and [Creating a Variant Module](./variant-module.md).

## What is an Action item?

An Action item (`ITEM_KIND.ACTION`) is a standard SoHL item that can be embedded on any Actor or Item. It carries executable logic that can fire:

- **On demand** — appearing as a context menu entry on the parent document's sheet.
- **During lifecycle** — automatically triggered at a specific lifecycle phase for a specific item type and shortcode.

Actions are conceptually similar to Macros bound to a specific Actor or Item, but they use a different underlying mechanism and integrate with SoHL's lifecycle, permissions, and data model.

Because Actions are embedded on specific documents, they only affect those documents — not all actors or items of that type globally.

## Action fields

| Field | Type | Description |
|-------|------|-------------|
| `subType` | `ActionSubType` | One of `BASIC`, `INTRINSIC_ACTION`, `SCRIPT_ACTION` |
| `scope` | `string` | Execution context: `SELF`, `ITEM`, `ACTOR`, or `OTHER` |
| `executor` | `string` | Method name (intrinsic) or JavaScript code (script) |
| `trigger` | `string` | JavaScript expression evaluated to determine availability |
| `visible` | `string` | `"true"` or JavaScript expression controlling context menu visibility |
| `title` | `string` | Display label |
| `isAsync` | `boolean` | Whether the action executes asynchronously |
| `iconFAClass` | `string` | FontAwesome CSS class for context menu icon |
| `group` | `string` | Context menu sort group (see below) |
| `permissions.execute` | `number` | Minimum Foundry user role required to execute |

### subType values

- **`BASIC`** — simplest form; executor and trigger are evaluated as plain JavaScript expressions.
- **`INTRINSIC_ACTION`** — executor is the name of a method on the parent document's logic class. Used for first-class actions defined in code.
- **`SCRIPT_ACTION`** — executor is a JavaScript code string, evaluated at runtime. Useful for GM-configured custom behaviors without writing a module.

### scope values

Determines what `this` context is provided when the executor runs:

- **`SELF`** — the Action item's own logic instance.
- **`ITEM`** — the item that owns this Action.
- **`ACTOR`** — the actor that owns this Action (or the actor that owns the item).
- **`OTHER`** — caller-supplied context object passed in the `SohlActionContext`.

### group values

Controls where the action appears in context menus:

- `ESSENTIAL` — top of the menu, always visible
- `GENERAL` — standard section
- `DEFAULT` — default sort position
- `HIDDEN` — never shown in context menus (lifecycle-only or internal use)

### permissions.execute

Minimum Foundry user role required to execute the action:

| Value | Role |
|-------|------|
| `0` | None (all users) |
| `1` | Player |
| `2` | Trusted Player |
| `3` | Owner (must own the document) |
| `4` | Assistant GM |
| `5` | Gamemaster |

## How actions are executed

### On-demand (context menu)

Actions embedded on an Actor or Item appear in the context menu on that document's sheet when:

- `visible` evaluates to truthy, and
- the current user meets the `permissions.execute` role requirement.

The user invokes the action directly from the sheet UI.

### Lifecycle-triggered actions

During each SoHL lifecycle phase (`initialize`, `evaluate`, `finalize`), `SohlActor.prepareEmbeddedData()` discovers and automatically executes Action items whose names match the pattern:

```
{itemType}.{shortcode}.post{Phase}
```

For example:
- `mysticalability.curse.postInitialize` — fires after the `curse` mystical ability completes `initialize()`.
- `skill.001.postFinalize` — fires after the skill with shortcode `001` completes `finalize()`.
- `weapongear.broadsword.postEvaluate` — fires after the `broadsword` weapon gear completes `evaluate()`.

The matching is:
1. `{itemType}` — the item's Foundry type string (e.g., `"skill"`, `"mysticalability"`).
2. `{shortcode}` — the item's `system.shortcode` value.
3. `post{Phase}` — `postInitialize`, `postEvaluate`, or `postFinalize`.

Lifecycle-triggered actions run **inside** the phase barriers, after the matching item completes its logic phase method but before the actor advances to the next phase.

### The SohlActionContext

Both on-demand and lifecycle execution receive a `SohlActionContext` object:

| Property | Type | Description |
|----------|------|-------------|
| `speaker` | `SohlSpeaker` | Who initiated the action (user/actor identity) |
| `target` | `SohlTokenDocument \| null` | Targeted token, if any |
| `skipDialog` | `boolean` | If true, skip any confirmation dialogs |
| `noChat` | `boolean` | If true, suppress chat output |
| `type` | `string` | Action type identifier |
| `title` | `string` | Display title for the execution context |
| `scope` | `object` | Arbitrary additional data supplied by the caller |

## Practical examples

### Recipe: lifecycle-triggered action on a specific item

Goal: run custom logic after a `skill` with shortcode `tactics` completes its `finalize()` phase.

1. Open the `Tactics` skill item on the actor.
2. Create an embedded Action item with:
   - **Name:** `skill.tactics.postFinalize`
   - **subType:** `SCRIPT_ACTION`
   - **scope:** `ITEM`
   - **executor:** your JavaScript logic (e.g., adjust a modifier on the skill)
   - **group:** `HIDDEN` (lifecycle-only, not shown in context menus)
3. Save. The executor runs automatically during each data-preparation cycle.

```js
// Example executor for scope=ITEM (this = the Tactics skill's logic)
const masteryLevel = this.item.system.masteryLevel;
if (masteryLevel >= 80) {
    this.item.system.someModifier.add("tactics-bonus", 5);
}
```

### Recipe: on-demand action on an actor

Goal: add a "Calculate Encumbrance" action to a Being actor.

1. Embed an Action item on the actor with:
   - **Name:** `Calculate Encumbrance` (any descriptive name)
   - **subType:** `SCRIPT_ACTION`
   - **scope:** `ACTOR`
   - **visible:** `"true"`
   - **group:** `GENERAL`
   - **permissions.execute:** `3` (owner)
2. The action appears in the actor's context menu for owners.

## When to use Actions vs other mechanisms

| Mechanism | Use when |
|-----------|----------|
| **Action item** | You need to affect one specific item or actor by name/shortcode |
| **Lifecycle Hook** | You need to affect all items of a given type (e.g., all skills) |
| **System Class Override** | You need deep behavioral changes requiring new classes |
| **Variant** | You need a coherent alternative rule family |

Actions are the narrowest, easiest scope. Prefer them over hooks when the behavior change is isolated to one item.
