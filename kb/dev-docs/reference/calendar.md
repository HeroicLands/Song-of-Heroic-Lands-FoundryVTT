---
aliases: []
name:
    full: Calendar Reference
    aliases: []
id: 3FnZNhXbtsrG5O2O
slug: calendar
type: doc
package: sohl
category: dev-docs
folder: null
---

# Calendar Reference

How SoHL displays in-world dates without depending on a calendar module, and how the system coexists with modules that manage calendars.

See also: [Lifecycle Hooks](../how-to/lifecycle-hooks.md), [Extension Points](../how-to/extension-points.md).

## Why native calendar support

The system needs to show in-world dates in sheets and chat — for example, an injury must display the world-time at which the next healing check is due. Historically, Foundry left calendar formatting to community modules (Simple Calendar, About Time, Foundryborne). That created two problems:

1. A system that uses calendar features acquires a hard dependency on a module the GM may not install.
2. The system author has to choose, at design time, which module(s) to support.

Foundry v14 introduced a built-in calendar API (`foundry.data.CalendarData`, `CONFIG.time.*`, `game.time.calendar`). SoHL builds directly on it. No shim layer, no module dependency, and calendar modules can still override the calendar the same way they always have — by setting `CONFIG.time.worldCalendarClass` and `worldCalendarConfig`.

## The Foundry v14 contract

The four extension points are all on `CONFIG.time`:

| Slot                                                     | Type                      | Purpose                                                     |
| -------------------------------------------------------- | ------------------------- | ----------------------------------------------------------- |
| `CONFIG.time.worldCalendarConfig`                        | `CalendarConfig`          | The data passed to the calendar constructor                 |
| `CONFIG.time.worldCalendarClass`                         | `typeof CalendarData`     | The class instantiated for `game.time.calendar`             |
| `CONFIG.time.formatters`                                 | `{[name]: TimeFormatter}` | Named formatters callable via `calendar.format(time, name)` |
| `CONFIG.time.earthCalendarConfig` / `earthCalendarClass` | same                      | The IRL companion calendar (`game.time.earthCalendar`)      |

Foundry constructs `game.time` inside `Game#setupGame()`. Construction reads `CONFIG.time.worldCalendarConfig` and `worldCalendarClass` and instantiates `new worldCalendarClass(deepClone(worldCalendarConfig), {strict: true})`. The `init` hook fires earlier (in `Game#initializeGame`), so any system that sets `CONFIG.time.*` in `init` is guaranteed to be in effect when `game.time` comes up.

The `updateWorldTime` hook fires after every world-time change — this is the universal coordination point. Calendar modules listen here and refresh their UIs; SoHL listens here to dispatch its timed event queue.

## SoHL's extension

### `SohlCalendarData`

`src/core/foundry/SohlCalendar.ts` defines `SohlCalendarData extends foundry.data.CalendarData` with one schema addition: an `era` subfield with `hasYearZero`, `name`, `abbrev`, `beforeName`, `beforeAbbrev`, and `description`. This lets a fantasy calendar express era labels (e.g. "TR" / "Before TR") without overloading the existing year fields.

`timeToComponents()` is overridden to return a `SohlCalendarComponents` shape that adds `eraYear`, `beforeEra`, `eraName`, and `eraAbbrev` to the standard `TimeComponents`. All formatters operate on this enriched shape.

### Three formatters

Defined as standalone functions in `src/core/logic/sohl-calendar-logic.ts` and registered into `CONFIG.time.formatters` (via `SohlSystem.CONFIG` in `src/core/foundry/sohl-config.ts`) under the `sohl.*` namespace (to guarantee no collision with built-in or module formatter names) and callable via `game.time.calendar.format(worldTime, name)`:

| Name               | SoHL calendar                                        | Foreign calendar                                                               | When to use                                               |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `"sohl.timestamp"` | ` 0722-04-15 14:30:00` (sign prefix, era-aware year) | `0722-04-15 14:30:00` (no prefix, raw year)                                    | Logs, sortable strings, internal storage                  |
| `"sohl.default"`   | `15 Highsun 722TR 14:30:00`                          | `15 {monthName} 722 14:30:00` (uses the active calendar's month names; no era) | Sheet displays, chat cards, anywhere a human reads it     |
| `"sohl.relative"`  | `3 days, 4 hours from now` / `2 hours ago`           | identical                                                                      | Countdowns, "next healing check in N days", recent events |

**All three formatters are safe to call against any active calendar.** Each performs an `instanceof SohlCalendarData` check at the top; on a foreign calendar instance they degrade to a calendar-agnostic format that uses only standard `CalendarData` fields and the active calendar's own month names. This means system code can call `game.time.calendar.format(t, "sohl.default")` without first checking which module owns the calendar.

`"sohl.relative"` also accepts options: `short` (compact form like `3d 4h`), `maxTerms` (cap the number of components), and `fromComponents` (anchor to a time other than the current world time). It never needed era data and is calendar-agnostic by construction.

### Built-in calendars — runtime-loaded data files

The shipped built-in calendars are **data files, not code**: `assets/calendar/*.json` (deployed to `systems/sohl/assets/calendar/`). They are **fetched over HTTP** — not bundled into the code — and registered into the calendar registry. `src/core/foundry/builtin-calendars.ts` holds only the manifest of paths (`BUILTIN_CALENDAR_PATHS`) and `DEFAULT_CALENDAR_SHORTCODE`; `registerBuiltinCalendars` in `sohl.ts` fetches each path and calls `SohlSystem.registerCalendar`. Because a built-in calendar must be registered **before Foundry constructs `game.time`** (and Foundry's `init` phase is synchronous, awaiting no async work), the fetch uses the **synchronous** `fvttFetchJsonSync` shim — keeping the data loose and runtime-fetched while matching the pre-`game.time` timing a static import used to give. (Modules, whose calendars are not needed until after `init`, use the async `sohl.fetchJson` instead.) Each file is self-describing — a stable **`shortcode`** (its registry id, and the value a character's `social.calendar` names), a display `label`, and the Foundry `CalendarData` `config`.

Two ship, both twelve 30-day months on a 10-day week (360-day year, four seasons, `yearZero: 720`, no year zero):

| Shortcode | Calendar             | Era     | Months                                                  |
| --------- | -------------------- | ------- | ------------------------------------------------------- |
| `vylrec`  | **Vylarian Reckoning** (default) | VR / BVR | Floralis, Lusenar, Murkas, Taranis, Vulcar, Menaris, Venuris, Karnavar, Morveth, Thanaris, Aetheris, Janar |
| `twheel`  | Turning Wheel        | AR      | Springtide, Blossomreach, Greengold, Highsun, Midsummer, Hayfall, Reapmoon, Emberwane, Fallmere, Frostwane, Snowrest, Thawrise |

The **Vylarian Reckoning** (`vylrec`) — the reckoning of the world of Thalorna — is the default active calendar; its months are what the Astrokýklos birthsign sign windows read as. All names are localization keys.

### Authoring birth dates in content

A being's `birthDate` (a world-time integer in seconds — the anchor birthsign astrology derives from, #1018) is authored in character content as a calendar date, not a raw timestamp. The content build maps it (#1039):

- **Authoring.** A character's YAML frontmatter carries `traits.birthday: Y/M/D` (era-year / month / day, e.g. `686/4/2`), alongside `traits.age`. Absent ⇒ no birthday ⇒ `birthDate` stays `null` (most creatures).
- **Birth calendar.** An optional `social.calendar` names the calendar the date is expressed in (its `shortcode`, e.g. `vylrec`). When omitted, the build uses the default calendar (`DEFAULT_CALENDAR_SHORTCODE`, currently `vylrec`). An unknown shortcode fails the build.
- **Conversion.** `utils/packs/calendars.mjs` reads the shipped `calendars/*.json` (the same data the runtime registers) to resolve the calendar `config`; the Foundry-free `src/utils/calendar-birthdate.mjs` then converts `Y/M/D` to seconds, mirroring Foundry's `CalendarData.componentsToTime`. That helper is a pure module (no Foundry, no `fs`), so it is unit-tested in Node against the calendar JSON.

Two design points settled here:

- **Stored value is calendar-agnostic; the birth calendar only interprets the authored date.** `birthDate` is a plain world-time integer. The birth calendar is used **once, at build time**, to turn the authored components into that integer; the birthsign derivation then reads the **active** calendar at runtime (the existing #1018 behavior), never the birth calendar. Because the shipped calendars share an identical structure (both 12 × 30-day months), a date authored in one and run under the other yields the same numeric `birthDate` and the same sign; only differently-structured calendars would reinterpret month/day.
- **`traits.age` is independent.** Age is left as authored free-standing content; the build neither derives it from `traits.birthday` nor validates it against the birthday. (Deriving a live age would require a campaign "current date" the packs do not carry.)

## Calendar registry and GM workflow

SoHL keeps a registry of calendars keyed by ID. `SohlSystem.registerCalendar(id, registration)` adds one; `applyCalendar(id)` makes it the active one by writing into `CONFIG.time.*`. The registry distinguishes **built-in** calendars (cannot be deleted) from **imported** ones (can be).

Two world settings drive the GM-facing workflow:

| Setting                  | Purpose                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sohl.activeCalendar`    | ID of the currently active calendar. Default `"vylrec"` (Vylarian Reckoning). Its `onChange` handler calls `SohlSystem.applyCalendar`, which re-initializes `game.time` — no reload required. |
| `sohl.importedCalendars` | Map of imported calendar configs persisted across sessions.                                                                                                                    |

The `Calendar Settings` menu (`src/apps/foundry/CalendarSettingsMenu.ts`) lets the GM:

- Select the active calendar from the registry
- Import a calendar from a JSON file (the file's `name` becomes the registry label; an ID is slugified from it)
- Delete imported calendars (built-ins are protected)

On reload, `src/sohl.ts` runs (in this order, during the **synchronous** `init` hook):

1. `registerSystemSettings()` — registers the two settings and the menu
2. `setupSystem()` — merges `SohlSystem.CONFIG` into Foundry's `CONFIG`. `worldCalendarConfig` starts as a **bootstrap placeholder** (`DEFAULT_CALENDAR_CONFIG`, an empty object) — the real config is applied below, before `game.time` is built
3. `registerBuiltinCalendars()` — **synchronously** fetches each built-in calendar data file (`fvttFetchJsonSync`) and registers it under its `shortcode`. The data is loaded here, not bundled
4. `rehydrateCalendars()` — re-registers all imported calendars from the world setting
5. `applyActiveCalendar()` — reads `sohl.activeCalendar` and calls `SohlSystem.applyCalendar(id)` (which overwrites the placeholder `worldCalendarConfig`), falling back to `"vylrec"` if the active ID is missing

Foundry then constructs `game.time` with SoHL's class and config. **The `init` phase completes before `game.time` construction** (verified against `client/game.mjs`: `Hooks.callAll("init")` runs in `initialize()`, `new helpers.GameTime()` runs later in the separate `setupGame()` phase). Because the built-in fetch is **synchronous**, the whole `init` hook — fetch, registration, and `applyActiveCalendar` — completes before `game.time`, with no race. (An async fetch cannot: Foundry awaits no async work between `init` and `game.time`, so the data would not land in time.)

### JSON import format

An imported calendar JSON should match the union of Foundry's `CalendarConfig` schema and SoHL's `era` extension. At minimum, `name` and `days` are required. Fields beyond the SoHL+Foundry schema are silently stripped under `{strict: true}`. Omitted `era` fields default to empty strings (won't crash, but `formatDefault` will produce an empty era abbreviation). See `nogit/tuzyen-reckoning-simple-calendar.json` for a working example.

## Module coexistence

SoHL is deliberately a polite citizen here. Modules override the calendar by setting the same `CONFIG.time.*` slots — whoever writes last, wins. Since module `init` hooks generally fire after system `init` hooks (or in a `setup` hook), an active calendar module will typically end up in control of `game.time.calendar`.

That is fine. Any SoHL code that wants a formatted date calls `sohl.calendar.format(worldTime, "sohl.default")` and accepts whatever string comes back. SoHL must **not** assume `sohl.calendar instanceof SohlCalendarData` in production code paths. As of this writing, no code outside `src/core/foundry/SohlCalendar.ts` and `src/core/logic/SohlSystem.ts` reads the SoHL-specific surface — verified by grepping `SohlCalendarData` across `src/`.

### Formatter safety under module override

The three SoHL formatters (`sohl.timestamp`, `sohl.default`, `sohl.relative`) are standalone functions in `src/core/logic/sohl-calendar-logic.ts`, registered into `CONFIG.time.formatters` under the `sohl.*` namespace (via `SohlSystem.CONFIG` in `src/core/foundry/sohl-config.ts`). The era-aware ones guard with an `isSohlCalendar` check at entry and fall through to a calendar-agnostic path when a foreign calendar is in charge. Specifically:

- `sohl.timestamp` drops the era-sign prefix and year-zero adjustment, producing `YYYY-MM-DD HH:MM:SS`.
- `sohl.default` reads month names from `calendar.months.values[m].name` (a field every `CalendarData` provides) and omits era information.
- `sohl.relative` never touched era data and works unchanged against any calendar.

This means: if a module replaces `worldCalendarClass` but leaves `CONFIG.time.formatters` alone, calls to `"sohl.*"` formatters still succeed and produce sensible output. The `sohl.*` namespace also guarantees no collision if a module installs its own `"default"` or `"timestamp"` formatter — both can coexist.

## Using the calendar from code

### Displaying a world date

The preferred accessor in SoHL code is `sohl.calendar` — it returns whatever `CalendarData` instance is currently installed at `game.time.calendar`, typed as the base `CalendarData<TimeComponents>` so callers can't accidentally lean on SoHL-only fields.

```typescript
import { fvttWorldTime } from "@src/core/FoundryHelpers";

const now = fvttWorldTime();
const human = sohl.calendar.format(now, "sohl.default"); // SoHL: "15 Highsun 722TR 14:30:00"; foreign: "15 {monthName} 722 14:30:00"
const stamp = sohl.calendar.format(now, "sohl.timestamp"); // SoHL: " 0722-04-15 14:30:00"; foreign: "0722-04-15 14:30:00"
const future = sohl.calendar.format(eventTime, "sohl.relative"); // "3 days, 4 hours until"
```

All three names are valid against any active calendar — see the formatter table above. For the SoHL-specific accessor `SohlCalendarData.worldDate` (returns `SohlCalendarComponents` for the current world time), see `src/core/foundry/SohlCalendar.ts`. That accessor is only safe when SoHL's calendar is actually active — prefer `sohl.calendar.timeToComponents(fvttWorldTime())` in code that should survive a foreign calendar override.

### Scheduling future events

Calendar **display** is one half of the use case; the other is **scheduling work to fire at a future world time**. SoHL provides `sohl.events` for that — see `src/entity/event/SohlEventQueue.ts`. The queue dispatches on the `updateWorldTime` hook (primary GM only). The injury → next-healing-check flow is the canonical example.

```typescript
// In a Logic class's finalize() — schedule the next check
sohl.events.scheduleAt(
    this.item.uuid,
    "healingTest",
    injury.logic.nextHealthCheck, // derived from the persisted anchor
    { level: this.data.levelBase },
);

// In the document's handleSohlEvent — fire the test, then re-schedule
```

When showing "next healing check at …" in a sheet, read the subscription's `fireAt` from `sohl.events.debug()` and pass it through `sohl.calendar.format(fireAt, "sohl.default")`.

### From a Handlebars template

Use the `displayWorldTime` helper registered in `src/sohl.ts`:

```hbs
{{! Defaults to "sohl.default" }}
Next healing check:
{{displayWorldTime injury.nextHealingCheck}}

{{! Pick any registered formatter via the format= hash arg }}
Logged at
{{displayWorldTime t format="sohl.timestamp"}}

{{! sohl.relative also accepts short / maxTerms via hash args }}
{{displayWorldTime eventTime format="sohl.relative" short=true maxTerms=2}}
```

The helper returns an empty string when the input is null/undefined/non-numeric or when `game.time.calendar` isn't yet available (e.g. during early setup). It catches and warns on formatter errors rather than throwing, so a missing or misnamed formatter never breaks a sheet render.

## Known gaps and future work

_None tracked at present. Add entries here as they surface._

## References

- Source: `src/core/foundry/SohlCalendar.ts`, `src/core/logic/SohlSystem.ts`, `src/apps/foundry/CalendarSettingsMenu.ts`, `src/sohl.ts`, `src/core/foundry/builtin-calendars.ts`, `assets/calendar/*.json`
- Tests: `tests/core/foundry/SohlCalendar.test.ts`
- Foundry v14: `client/helpers/time.mjs` (`GameTime`, `initializeCalendar`), `client/data/calendar.mjs` (`CalendarData`), `client/game.mjs` (`Game#initializeGame` and `Game#setupGame`)
- Foundry TS types: `node_modules/fvtt-types/src/foundry/client/data/calendar.d.mts`
