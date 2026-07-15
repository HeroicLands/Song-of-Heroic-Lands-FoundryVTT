---
"sohl": patch
---

**Fix future-tense relative time rendering; correct calendar docs**

The `sohl.relative` formatter wraps future durations with the SoHL-owned
`SOHL.TIME.Until` localization key, which was missing from `lang/en.json` — so
"… from now" times rendered the raw key while past ("… ago") times worked. Adds
the key (`{since} from now`).

Also corrects `docs/reference/calendar.md`, which described the three formatters
as static methods on `SohlCalendarData` registered in `SohlSystem.ts`; they are
standalone functions in `sohl-calendar-logic.ts` registered via `sohl-config.ts`,
and the `sohl.relative` example is updated to the real output.

Closes #477.
