---
"sohl": minor
---

**Built-in calendars load from JSON data files, and a new Vylarian Reckoning calendar ships as the default**

The shipped built-in calendars are now **data files, not code**. Instead of the
hard-coded `SOHL_DEFAULT_CALENDAR_CONFIG` constant, the system loads
`src/core/foundry/calendars/*.json` at init and registers each into the calendar
registry. Each file is self-describing — a stable **`shortcode`** (its registry
id, and the value a character's `social.calendar` will name), a display `label`,
and the Foundry `CalendarData` config. Closes #1038.

- **New default: the Vylarian Reckoning (`vylrec`)** — the reckoning of the world
  of Thalorna. Twelve 30-day months (Floralis, Lusenar, Murkas, Taranis, Vulcar,
  Menaris, Venuris, Karnavar, Morveth, Thanaris, Aetheris, Janar), a 10-day week,
  the **VR / BVR** era, `yearZero: 720`, no year zero.
- **The Turning Wheel (`twheel`)** is unchanged in content — same months, week,
  seasons, and era — only relocated from the TypeScript constant into its own
  data file, and it remains selectable via the Calendar Settings menu.
- New worlds default to `vylrec`; the fallback and the settings menu follow the
  new default shortcode. Existing calendar registry, import, and formatter
  behavior is otherwise unchanged.
