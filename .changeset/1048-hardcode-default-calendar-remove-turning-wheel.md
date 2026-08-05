---
"sohl": patch
---

**Remove the Turning Wheel calendar; hardcode the default Vylarian Reckoning in code**

The system now ships a **single** built-in calendar, the **Vylarian Reckoning**
(`vylrec`, the default), and the **Turning Wheel** (`twheel`) is removed.

The Vylarian Reckoning is **hardcoded in code** — a framework-free
`VYLARIAN_RECKONING` constant in `src/core/foundry/vylarian-reckoning.mjs`, shared
by the runtime and the content build — rather than loaded from a JSON data file.
It is available synchronously at module load and registered before Foundry builds
`game.time`, so there is no fetch or init-timing concern and nothing ships loose
under `assets/`.

Worlds may still add their own calendars through the Calendar Settings menu, and
modules through `SohlSystem.registerCalendar(...)`. Closes #1048.
