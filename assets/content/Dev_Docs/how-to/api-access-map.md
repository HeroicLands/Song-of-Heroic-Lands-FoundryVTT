---
type: doc
subType: howto
name:
  full: API Access Map (Macros and Modules)
  aliases: []
shortcode: apiaccessmap
pack: none
sohl:
  kbcat: devdocs
---

# API Access Map (Macros and Modules)

> **Audience:** Macro authors and variant-module developers who want to reach
> SoHL's rules surface from outside the system source.

See also: [[doc-extensionpoints|Extension Points]], [[doc-lifecyclehooks|Lifecycle Hooks]], [[doc-houserulescookbook|House Rules Cookbook]].

Everything is reachable at runtime through Foundry's `game` global and the SoHL
`sohl` global (an instance of {@link sohl.core.logic.SohlSystem}). This page maps **what you
want** to **how to reach it**.

## Documents — a specific actor or item

Reach a document through Foundry's collections, then use the `.logic` getter to
get the typed rules surface:

```js
const actor = game.actors.get(actorId);
const being = actor.logic; // typed BeingLogic-style rules surface

const item = game.items.get(itemId);
const skill = item.logic; // typed SkillLogic-style rules surface
```

`document.logic` is equivalent to `document.system.logic`. It is the Foundry-free
Logic object that carries the game rules for that document (see {@link sohl.core.logic.SohlLogic}).

## All actor / item logics

Iterate every prepared logic without walking collections yourself:

```js
sohl.actorLogics; // SohlActorLogic[] for all actors in the world
sohl.itemLogics; // SohlItemLogic[] for all world + embedded items
```

## System services

The `sohl` global exposes the shared services:

| Service          | What it is                                    |
| ---------------- | --------------------------------------------- |
| `sohl.log`       | System logger; `uiWarn` / `uiError` notify UI |
| `sohl.i18n`      | Localization helper                           |
| `sohl.events`    | In-memory trigger / event dispatcher          |
| `sohl.utils`     | Utility helpers                               |
| `sohl.constants` | System constants                              |
| `sohl.CONFIG`    | System configuration                          |

## Constructable entity classes

The value objects meant to be `new`ed or subclassed are exposed through the
getter-backed registry at `sohl.entity.<ClassName>`. Reaching them through the
registry (rather than importing the source) means module overrides are picked up
automatically. Categories:

- **Modifiers** — `ValueModifier`, `ValueDelta`, `CombatModifier`,
  `ImpactModifier`, `MasteryLevelModifier`
- **Results** — `TestResult`, `SuccessTestResult`, `OpposedTestResult`,
  `ImpactResult`, `AttackResult`, `DefendResult`, `CombatResult`
- **Strike modes** — `StrikeModeBase`, `MeleeStrikeMode`, `MissileStrikeMode`
- **Action** — {@link sohl.entity.action.SohlAction}
- **Body modeling** — `BodyStructure`, `BodyPart`, `BodyLocation`

Construct one:

```js
const mod = new sohl.entity.ValueModifier(data, { parent });
```

Subclass one (e.g. in a variant module):

```js
class MyResult extends sohl.entity.SuccessTestResult {
  // override rules here
}
```

Every class is also addressable by its source-mirroring namespace path —
`sohl.entity.modifier.ValueModifier`, `sohl.document.effect.foundry.SohlActiveEffect`,
etc. (see [[doc-sohlapi|The SoHL API → namespace tree]]). Use those
paths for reference and discovery, but **construct and override through the flat
`sohl.entity.<ClassName>` registry above** — only its getters honor a `register()`
override; a namespace path always resolves to the original class.

## Reaching SoHL at runtime {#reaching-sohl-at-runtime}

SoHL is a Foundry _system_ (a manifest and the built `sohl.js` bundle), not an
npm package. Foundry loads it into the page, and a variant or extension module
reaches every value through the live **`sohl`** global that is already there:
`new sohl.entity.ValueModifier(...)`, `sohl.document.effect.foundry.SohlActiveEffect`,
`sohl.log`, and so on. A module **never imports the system's runtime code** —
doing so would load a second copy of the system.
