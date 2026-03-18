---
title: "Actions"
slug: "actions"
category: "User Guide"
sort: 80
tags:
    - items
    - actors
    - action
    - procedure
    - house-rules
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is an Action? {#action-overview}

An Action is an executable procedure attached to an actor or nested within
another item. Actions represent things a character can actively do — making
a skill test, performing a special maneuver, activating a unique ability,
or triggering any other defined procedure. Actions provide buttons on the
actor sheet that players and GMs can click to initiate the procedure,
streamlining gameplay by packaging complex rule sequences into a single
click.

Actions are also SoHL's built-in mechanism for house rules and customization
at the item level. An advanced GM can attach a Script Action to a specific
actor or item to change how it behaves, without needing to write a Foundry
module or modify system files.

# Where Actions Appear {#action-where}

Actions can be attached directly to **Actors** (Beings, Cohorts, Structures,
Vehicles, Assemblies) or **nested inside any Item**. Both are fully supported:

- **Directly on an Actor** — the Action belongs to the actor and can
  operate on the actor or any of its items.
- **Nested inside an Item** — the Action belongs to that item specifically.
  For example, a Weapon Gear item might contain an Action for a special
  attack, or a Skill item might include an Action for its standard test.
  The Action can then target its parent item, the actor that owns it, or
  the Action itself.

Actions appear in the UI in two places:

- **Actor sheet Actions tab** — all Actions on the actor (both directly
  attached and nested inside items) are listed here as clickable buttons.
- **Item sheet Actions section** — when an item has nested Actions, they
  appear inline within that item's own sheet.

# Action Types {#action-types}

Every Action has a **Type** (called `subType` internally) that determines what
kind of logic it runs.

## Built-in Actions (Intrinsic)

Built-in Actions are part of the system itself. They call a named method on the
owning item or actor's logic. You cannot change what a built-in action does
by editing it — they are defined in system code. You will encounter these on
compendium items (skills, weapon strike modes, etc.) as the standard test and
maneuver buttons.

You will rarely create intrinsic actions yourself; they are placed by the system
and compendium packs.

## Script Actions {#action-type-script}

A Script Action contains a snippet of JavaScript that runs when the action
is triggered. This is the mechanism for **per-actor and per-item house rules
and custom procedures** — no module installation required.

Script actions are powerful but require basic JavaScript knowledge. The code
runs with access to the actor or item that owns the action, giving you the
ability to read and modify data during execution.

## Basic Actions {#action-type-basic}

A Basic Action is the simplest type. Like Script Actions, it runs JavaScript,
but it's intended for straightforward executable expressions rather than
multi-line scripts. Use this type when your logic fits in a single expression.

# Key Fields {#action-properties}

| Field | Description |
|-------|-------------|
| **Name** | What the action is called. Lifecycle-triggered actions must follow a specific naming pattern (see below). |
| **Type** | `Intrinsic Action`, `Script Action`, or `Basic` — determines how the action executes. |
| **Scope** | What context `this` refers to when the action runs: `Self` (the action itself), `Item` (the owning item), `Actor` (the owning actor), or `Other`. |
| **Executor** | For Script/Basic: the JavaScript code to run. For Intrinsic: the method name on the logic class. |
| **Trigger** | A JavaScript expression that determines whether the action is currently available. If it evaluates to `false`, the action button is disabled. |
| **Visible** | A JavaScript expression (or `"true"`) controlling whether the action appears in context menus and button lists. |
| **Async** | Check this if the action code uses `async`/`await`. |
| **Icon** | FontAwesome CSS class for the context menu icon (e.g., `fas fa-dice`). |
| **Group** | Where in the context menu the action appears. `Essential` actions appear first; `Hidden` actions never appear in menus (lifecycle-only). |
| **Permission: Execute** | The minimum Foundry user role required to trigger this action. |

# Creating an Action {#action-create}

1. Open the Actor or Item sheet where you want to add the Action.
2. Navigate to the **Actions** tab (on the Actor) or the item's **Actions**
   section.
3. Click **Create Action** (or use the `+` button).
4. Fill in the Name, Type, and Executor fields.
5. Set Scope to `Item` or `Actor` depending on what the action should operate on.
6. Set Visible to `"true"` if you want it to appear as a button.
7. Save.

The action now appears on the sheet and can be clicked to execute.

# On-Demand vs Lifecycle-Triggered Actions {#action-execution}

Actions can fire in two ways:

## On-Demand

When **Visible** evaluates to `true` and the user meets the **Permission**
requirement, the action appears as a clickable button on the sheet. Clicking
it executes the action immediately.

## Lifecycle-Triggered {#action-lifecycle}

SoHL runs a preparation cycle on actors and items whenever data changes. You
can hook an action into this cycle automatically by giving it a name that
follows this pattern:

```
{itemType}.{shortcode}.post{Phase}
```

Where:
- `{itemType}` is the item type in lowercase (e.g., `skill`, `mysticalability`, `weapongear`)
- `{shortcode}` is the item's **Shortcode** field value
- `{phase}` is `Initialize`, `Evaluate`, or `Finalize`

**Examples:**

| Action name | Meaning |
|-------------|---------|
| `skill.tactics.postFinalize` | Runs after the Tactics skill finishes its finalize phase |
| `mysticalability.curse.postInitialize` | Runs after the Curse ability finishes its initialize phase |
| `weapongear.broadsword.postEvaluate` | Runs after the Broadsword item finishes its evaluate phase |

Lifecycle-triggered actions run automatically during every data-preparation
cycle. They do **not** need to be visible — set their **Group** to `Hidden`
to keep them out of context menus.

### Which phase to use?

| Phase | What it means | Use for |
|-------|---------------|---------|
| `Initialize` | Item is being set up; other items may not be ready | Setting initial values on this item only |
| `Evaluate` | All items have been initialized; first-pass calculations | Computing derived values from multiple items |
| `Finalize` | All evaluations complete; final cross-item dependencies | Final adjustments that depend on other items' evaluated state |

When in doubt, use `postFinalize` — it runs last and has access to all other
items' computed values.

### Setting up a lifecycle action

1. Find the item you want to modify (e.g., a skill named "Tactics" with
   shortcode `tactics`).
2. Create an Action on the **same actor** (either directly on the actor or
   nested inside the Tactics skill) with name `skill.tactics.postFinalize`.
3. Set **Type** to `Script Action`.
4. Set **Scope** to `Item`.
5. Set **Group** to `Hidden` (it's lifecycle-only, not a button).
6. Write your executor code. The `this` value is the Tactics skill's logic
   object when scope is `Item`.
7. Save.

The action runs automatically after every data-preparation cycle for the
Tactics skill on that actor.

# Permissions and Visibility {#action-permissions}

## Permission: Execute

Controls who can trigger the action. Values:

| Level | Who can execute |
|-------|----------------|
| 0 — None | Anyone (all users including observers) |
| 1 — Player | Any player |
| 2 — Trusted | Trusted players |
| 3 — Owner | Must own this actor/item |
| 4 — Assistant | Assistant GMs |
| 5 — Gamemaster | GM only |

## Visible

A JavaScript expression evaluated at display time. If it returns truthy, the
action appears in buttons and context menus. If it returns falsy, the action
is hidden. Set to `"true"` (the string) to always show it.

Lifecycle-triggered actions should typically set Visible to `"false"` or
Group to `Hidden` — they run automatically and do not need to appear as
buttons.

## Group

Controls the context menu section:

| Group | Location in menu |
|-------|-----------------|
| `Essential` | Top of the menu; highest priority |
| `General` | Standard section |
| `Default` | Default sort position |
| `Hidden` | Never shown in context menus |
