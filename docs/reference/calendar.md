# Calendar Reference

How SoHL displays in-world dates without depending on a calendar module, and how the system coexists with modules that manage calendars.

See also: [Lifecycle Hooks](../how-to/lifecycle-hooks.md), [Extension Points](../how-to/extension-points.md), [Injuries and Healing](./injuries-healing.md).

## Why native calendar support

The system needs to show in-world dates in sheets and chat — for example, an injury must display the world-time at which the next healing check is due. Historically, Foundry left calendar formatting to community modules (Simple Calendar, About Time, Foundryborne). That created two problems:

1. A system that uses calendar features acquires a hard dependency on a module the GM may not install.
2. The system author has to choose, at design time, which module(s) to support.

Foundry v14 introduced a built-in calendar API (`foundry.data.CalendarData`, `CONFIG.time.*`, `game.time.calendar`). SoHL builds directly on it. No shim layer, no module dependency, and calendar modules can still override the calendar the same way they always have — by setting `CONFIG.time.worldCalendarClass` and `worldCalendarConfig`.

## The Foundry v14 contract

The four extension points are all on `CONFIG.time`:

| Slot | Type | Purpose |
|---|---|---|
| `CONFIG.time.worldCalendarConfig` | `CalendarConfig` | The data passed to the calendar constructor |
| `CONFIG.time.worldCalendarClass` | `typeof CalendarData` | The class instantiated for `game.time.calendar` |
| `CONFIG.time.formatters` | `{[name]: TimeFormatter}` | Named formatters callable via `calendar.format(time, name)` |
| `CONFIG.time.earthCalendarConfig` / `earthCalendarClass` | same | The IRL companion calendar (`game.time.earthCalendar`) |

Foundry constructs `game.time` inside `Game#setupGame()`. Construction reads `CONFIG.time.worldCalendarConfig` and `worldCalendarClass` and instantiates `new worldCalendarClass(deepClone(worldCalendarConfig), {strict: true})`. The `init` hook fires earlier (in `Game#initializeGame`), so any system that sets `CONFIG.time.*` in `init` is guaranteed to be in effect when `game.time` comes up.

The `updateWorldTime` hook fires after every world-time change — this is the universal coordination point. Calendar modules listen here and refresh their UIs; SoHL listens here to dispatch its timed event queue.

## SoHL's extension

### `SohlCalendarData`

`src/core/SohlCalendar.ts` defines `SohlCalendarData extends foundry.data.CalendarData` with one schema addition: an `era` subfield with `hasYearZero`, `name`, `abbrev`, `beforeName`, `beforeAbbrev`, and `description`. This lets a fantasy calendar express era labels (e.g. "TR" / "Before TR") without overloading the existing year fields.

`timeToComponents()` is overridden to return a `SohlCalendarComponents` shape that adds `eraYear`, `beforeEra`, `eraName`, and `eraAbbrev` to the standard `TimeComponents`. All formatters operate on this enriched shape.

### Three formatters

Registered into `CONFIG.time.formatters` in `src/core/SohlSystem.ts` under the `sohl.*` namespace (to guarantee no collision with built-in or module formatter names) and callable via `game.time.calendar.format(worldTime, name)`:

| Name | SoHL calendar | Foreign calendar | When to use |
|---|---|---|---|
| `"sohl.timestamp"` | ` 0722-04-15 14:30:00` (sign prefix, era-aware year) | `0722-04-15 14:30:00` (no prefix, raw year) | Logs, sortable strings, internal storage |
| `"sohl.default"` | `15 Highsun 722TR 14:30:00` | `15 {monthName} 722 14:30:00` (uses the active calendar's month names; no era) | Sheet displays, chat cards, anywhere a human reads it |
| `"sohl.relative"` | `3 days, 4 hours until` / `2 hours ago` | identical | Countdowns, "next healing check in N days", recent events |

**All three formatters are safe to call against any active calendar.** Each performs an `instanceof SohlCalendarData` check at the top; on a foreign calendar instance they degrade to a calendar-agnostic format that uses only standard `CalendarData` fields and the active calendar's own month names. This means system code can call `game.time.calendar.format(t, "sohl.default")` without first checking which module owns the calendar.

`"sohl.relative"` also accepts options: `short` (compact form like `3d 4h`), `maxTerms` (cap the number of components), and `fromComponents` (anchor to a time other than the current world time). It never needed era data and is calendar-agnostic by construction.

### Default calendar — "Turning Wheel"

`src/utils/constants.ts` exports `SOHL_DEFAULT_CALENDAR_CONFIG`. Twelve 30-day months (Springtide, Blossomreach, Greengold, Highsun, Midsummer, Hayfall, Reapmoon, Emberwane, Fallmere, Frostwane, Snorest, Thawrise), a 10-day week, 360-day year, four seasons, `yearZero: 720`, era abbreviation `TR`. All names are localization keys.

## Calendar registry and GM workflow

SoHL keeps a registry of calendars keyed by ID. `SohlSystem.registerCalendar(id, registration)` adds one; `applyCalendar(id)` makes it the active one by writing into `CONFIG.time.*`. The registry distinguishes **built-in** calendars (cannot be deleted) from **imported** ones (can be).

Two world settings drive the GM-facing workflow:

| Setting | Purpose |
|---|---|
| `sohl.activeCalendar` | ID of the currently active calendar. Default `"sohl-default"`. Its `onChange` handler calls `SohlSystem.applyCalendar`, which re-initializes `game.time` — no reload required. |
| `sohl.importedCalendars` | Map of imported calendar configs persisted across sessions. |

The `Calendar Settings` menu (`src/apps/CalendarSettingsMenu.ts`) lets the GM:

- Select the active calendar from the registry
- Import a calendar from a JSON file (the file's `name` becomes the registry label; an ID is slugified from it)
- Delete imported calendars (built-ins are protected)

On reload, `src/sohl.ts` runs (in this order, during `init`):

1. `registerSystemSettings()` — registers the two settings and the menu
2. `setupSystem()` — merges `SohlSystem.CONFIG` into Foundry's `CONFIG`, installing `worldCalendarConfig`, `worldCalendarClass`, and the three formatters
3. `rehydrateCalendars()` — re-registers all imported calendars from the world setting
4. `applyActiveCalendar()` — reads `sohl.activeCalendar` and calls `SohlSystem.applyCalendar(id)`, falling back to `"sohl-default"` if the active ID is missing

Foundry then constructs `game.time` with SoHL's class and config. **The `init` hook is guaranteed to run before `game.time` construction** (verified against `client/game.mjs`: `Hooks.callAll("init")` runs in `initializeGame()`, `new helpers.GameTime()` runs later in `setupGame()`).

### JSON import format

An imported calendar JSON should match the union of Foundry's `CalendarConfig` schema and SoHL's `era` extension. At minimum, `name` and `days` are required. Fields beyond the SoHL+Foundry schema are silently stripped under `{strict: true}`. Omitted `era` fields default to empty strings (won't crash, but `formatDefault` will produce an empty era abbreviation). See `nogit/tuzyen-reckoning-simple-calendar.json` for a working example.

## Module coexistence

SoHL is deliberately a polite citizen here. Modules override the calendar by setting the same `CONFIG.time.*` slots — whoever writes last, wins. Since module `init` hooks generally fire after system `init` hooks (or in a `setup` hook), an active calendar module will typically end up in control of `game.time.calendar`.

That is fine. Any SoHL code that wants a formatted date calls `sohl.calendar.format(worldTime, "sohl.default")` and accepts whatever string comes back. SoHL must **not** assume `sohl.calendar instanceof SohlCalendarData` in production code paths. As of this writing, no code outside `src/core/SohlCalendar.ts` and `src/core/SohlSystem.ts` reads the SoHL-specific surface — verified by grepping `SohlCalendarData` across `src/`.

### Formatter safety under module override

The three SoHL formatters (`sohl.timestamp`, `sohl.default`, `sohl.relative`) are static methods on `SohlCalendarData`, registered into `CONFIG.time.formatters` under the `sohl.*` namespace. Each guards with `instanceof SohlCalendarData` at entry and falls through to a calendar-agnostic path when a foreign calendar is in charge. Specifically:

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
const human   = sohl.calendar.format(now, "sohl.default");     // SoHL: "15 Highsun 722TR 14:30:00"; foreign: "15 {monthName} 722 14:30:00"
const stamp   = sohl.calendar.format(now, "sohl.timestamp");   // SoHL: " 0722-04-15 14:30:00"; foreign: "0722-04-15 14:30:00"
const future  = sohl.calendar.format(eventTime, "sohl.relative"); // "3 days, 4 hours until"
```

All three names are valid against any active calendar — see the formatter table above. For the SoHL-specific accessor `SohlCalendarData.worldDate` (returns `SohlCalendarComponents` for the current world time), see `src/core/SohlCalendar.ts`. That accessor is only safe when SoHL's calendar is actually active — prefer `sohl.calendar.timeToComponents(fvttWorldTime())` in code that should survive a foreign calendar override.

### Scheduling future events

Calendar **display** is one half of the use case; the other is **scheduling work to fire at a future world time**. SoHL provides `sohl.events` for that — see `src/core/SohlEventQueue.ts`. The queue dispatches on the `updateWorldTime` hook (primary GM only). The injury → next-healing-check flow is the canonical example.

```typescript
// In a Logic class's finalize() — schedule the next check
sohl.events.scheduleAt(
    this.item.uuid,
    "healingTest",
    game.time.worldTime + game.settings.get("sohl", "healingSeconds"),
    { level: this.data.levelBase },
);

// In the document's handleSohlEvent — fire the test, then re-schedule
```

When showing "next healing check at …" in a sheet, read the subscription's `fireAt` from `sohl.events.debug()` and pass it through `sohl.calendar.format(fireAt, "sohl.default")`.

### From a Handlebars template

Use the `displayWorldTime` helper registered in `src/sohl.ts`:

```hbs
{{!-- Defaults to "sohl.default" --}}
Next healing check: {{displayWorldTime injury.nextHealingCheck}}

{{!-- Pick any registered formatter via the format= hash arg --}}
Logged at {{displayWorldTime t format="sohl.timestamp"}}

{{!-- sohl.relative also accepts short / maxTerms via hash args --}}
{{displayWorldTime eventTime format="sohl.relative" short=true maxTerms=2}}
```

The helper returns an empty string when the input is null/undefined/non-numeric or when `game.time.calendar` isn't yet available (e.g. during early setup). It catches and warns on formatter errors rather than throwing, so a missing or misnamed formatter never breaks a sheet render.

## Known gaps and future work

_None tracked at present. Add entries here as they surface._

## References

- Source: `src/core/SohlCalendar.ts`, `src/core/SohlSystem.ts`, `src/apps/CalendarSettingsMenu.ts`, `src/sohl.ts`, `src/utils/constants.ts` (`SOHL_DEFAULT_CALENDAR_CONFIG`)
- Tests: `tests/core/SohlCalendar.test.ts`
- Foundry v14: `client/helpers/time.mjs` (`GameTime`, `initializeCalendar`), `client/data/calendar.mjs` (`CalendarData`), `client/game.mjs` (`Game#initializeGame` and `Game#setupGame`)
- Foundry TS types: `node_modules/fvtt-types/src/foundry/client/data/calendar.d.mts`
