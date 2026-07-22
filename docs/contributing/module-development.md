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

(See Foundry's [Module Development](https://foundryvtt.com/article/module-development/)
article for the full manifest schema.) Your module's `esmodules` entry script
then hooks into the system at runtime — a minimal skeleton:

```js
// scripts/my-module.js
Hooks.once("init", () => {
    console.log("my-module | init");
    // Register settings, keybindings, etc. here.
});

Hooks.once("ready", () => {
    // `sohl` and every document's `.logic` are available from here on.
    // Extend behavior with SoHL lifecycle hooks (see below) — never edit core.
    Hooks.on("sohl.mysticalability.postFinalize", (item, ctx) => {
        // your house rule
    });
});
```

## Reaching the SoHL API

A module reaches SoHL through the same two surfaces any script uses — the global
`sohl` object (system-wide services and helpers) and each document's `.logic`
(per-document state and actions). See **[The SoHL API](../concepts/sohl-api.md)**
for both surfaces and the `SohlSystem` member reference. For **type-safe** module
development, install the generated types package
(`npm install -D @heroiclands/sohl-types`) and reference it in your `tsconfig.json`
(`"types": ["@heroiclands/sohl-types"]`) — it types the `sohl` global and exports
the public class/interface types for annotations (see
[API Access Map](../how-to/api-access-map.md#type-declarations-for-a-typescript-module)).

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

### Scheduling deferred actions

A module can schedule an **action** to come due at a future world time — a
recurring "check for bandits" roll, a wound's next healing test, a seasonal
upkeep prompt. This is the generic scheduler (issue #588). It never _performs_
the action on its own: when the schedule comes due, SoHL posts a `[Perform]`
reminder card addressed to the document's owner, and only their click runs it.
That is the [Prime Directive](https://kb.heroiclands.org/dev/) in mechanism form —
_reminding is allowed; performing is not._

**1. Put the action on a document.** The thing you schedule is an ordinary SoHL
action — an `actionDefs` entry on the host document's `system`, typically a
Script Action referencing a permission-gated Macro (see
[Macros and Actions](../concepts/macros-and-actions.md); never inline code into
data). The host must be a document that carries `system.scheduledActions`, which
means one whose data model extends the base `SohlDataModel`: an **actor** or an
**item**. Scenes and active effects extend `TypeDataModel` directly and _cannot_
host a schedule.

**2. Schedule it** with `sohl.schedule`, from any owner of the document:

```js
// interval is in seconds of world time; payload is opaque scope handed to the
// action when the owner clicks [Perform].
await sohl.schedule(item, "healingTest", 24 * 60 * 60, { severity: 3 });
```

`sohl.schedule(doc, actionName, interval, payload?)` does two things atomically:
persists the schedule to `doc.system.scheduledActions` (the durable record,
anchored at the current world time) **and** arms the live event queue. Both halves
derive the fire time from the same anchor + interval, so they cannot drift. To
make a schedule **recurring**, call `sohl.schedule` again from inside the action
after it performs — each occurrence schedules the next. `sohl.unschedule(doc,
actionName)` removes both halves.

> **Consent (issue #579): offer, don't auto-re-arm.** A recurring action must not
> silently reschedule itself — that would make the system act without a human. When
> due, the queue posts an owner-gated `[Perform]` reminder (it never runs the
> action); on the click the action performs, then **offers** the next occurrence
> and only schedules it on a yes. The core effects use the shared
> `offerSchedule(context, doc, actionName, interval)` helper (a `context.scope.schedule`
> answer, else a private default-No dialog); a module action can call `sohl.schedule`
> conditionally on its own confirmation. Reserve unconditional re-arming for
> genuinely ambient, GM-only world-host clocks (e.g. a bandit check).

**3. World-wide actions** have no natural document to hang off. Use the singleton
**world host** actor:

```js
const host = await sohl.worldHost(); // find-or-create the `_sohlworld` actor
if (host) await sohl.schedule(host, "checkForBandits", 6 * 60 * 60);
```

`sohl.worldHost()` returns the reserved `_sohlworld` actor, creating it (GM only,
ownership NONE so players never see it) if absent. Because it is an actor it
already has the execution surface a `[Perform]` needs. Pass `{ visibility: "gm" }`
in the payload to whisper the reminder to the GM only — no metagame leak for
world events.

**4. Scene-scoped actions** — most events belong to a **place** (bandits at a
hideout, a hazard on a caravan path), not the whole world. Pass a `sceneUuid` and
the schedule fires only while that scene is the **active** scene:

```js
await sohl.schedule(
    host,
    "checkForBandits",
    4 * 60 * 60,
    { visibility: "gm" },
    scene.uuid,
);
```

`sohl.schedule(doc, actionName, interval, payload?, sceneUuid?)` — with a
`sceneUuid`, a check that comes due while the party is elsewhere is **held, not
lost**: it surfaces the moment they return to (re-activate) that scene, and no
occurrences accrue while away. Omit `sceneUuid` (as in the examples above) for a
genuinely world-wide clock — a plague, a season — that fires regardless of the
active scene. A schedule on an unlinked token's actor is naturally scene-scoped:
name its token's scene.

**The reload path is automatic.** The event queue is rebuilt from scratch each
session, so on the `ready` hook SoHL re-arms every world actor and its embedded
items from their persisted `system.scheduledActions` (scene binding included). You
schedule once; it survives reloads without any further wiring on your part.

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
standalone module), see [System Development](./system-development.md).
