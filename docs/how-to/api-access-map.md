# API Access Map (Macros and Modules)

> **Audience:** Macro authors and variant-module developers who want to reach
> SoHL's rules surface from outside the system source.

See also: [Extension Points](./extension-points.md), [Lifecycle Hooks](./lifecycle-hooks.md), [House Rules Cookbook](./house-rules-cookbook.md).

Everything is reachable at runtime through Foundry's `game` global and the SoHL
`sohl` global (an instance of {@link SohlSystem}). This page maps **what you
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
Logic object that carries the game rules for that document (see {@link SohlLogic}).

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
- **Action** — {@link SohlAction}
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

## Calendar registration

Register a world calendar with the static
{@link SohlSystem.registerCalendar} method. See the
[Calendar reference](../reference/calendar.md) for the calendar shape and
worked examples.

```js
SohlSystem.registerCalendar("my-calendar", {
    /* calendar definition */
});
```

## Type declarations for a TypeScript module

For a TypeScript module, copy the types-only declaration file
[`types/sohl-public-api.d.ts`](../../types/sohl-public-api.d.ts) into your
module's `types/` directory and reference it in your `tsconfig.json`. It
re-exports the Logic/Data interfaces and the domain class types for annotations;
runtime binding stays through the live `sohl` global.
