---
"sohl": patch
---

**Reorganize the source tree**

Internal source reorganization to separate Foundry-bound infrastructure from the
Foundry-free logic and domain layers. No behavior change.

- **`src/core` split by coupling.** Foundry-bound infrastructure moves to
  `src/core/foundry/` (`sohl-config.ts`, `SohlCalendar.ts`, `SohlDataModel.ts`,
  `URLField.ts`); the Foundry-free logic runtime moves to `src/core/logic/`
  (`SohlLogic.ts`, `SohlSystem.ts`, `SohlSpeaker.ts`, `SohlHookBridge.ts`).
- **`src/domain` → `src/entity`.** The whole domain tree (action, body, modifier,
  movement, result, strikemode) moves under `src/entity/`, joined by new
  `src/entity/roll/`, `src/entity/event/`, and `src/entity/domain/` homes for the
  roll primitive, event queue, and domain registry.
- **Kebab-case filenames.** Several modules are renamed to match the convention
  (`armor-aggregation.ts`, `injury-resolution.ts`, `weighted-random.ts`,
  `move-helpers.ts`, `event-trigger.ts`, `builtin-domains.ts`, …); `@src/…`
  imports are updated throughout, and the `eslint.config.js` Foundry-free-zone
  list is repointed at the new paths.
- **Calendar Foundry/logic split.** `SohlCalendar`'s pure timestamp/formatting
  helpers are extracted into `src/core/logic/sohl-calendar-logic.ts`; the Foundry
  `CalendarData` subclass stays in `src/core/foundry/`.
- **Dead code removed.** `src/utils/actionInput.ts` (the `DialogBypassContext`
  interface) is deleted — it had no remaining references.
