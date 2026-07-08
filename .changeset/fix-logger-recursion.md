---
"sohl": patch
---

Fix infinite recursion (stack overflow) in `SohlLogger.uiWarn` / `uiInfo` / `uiError`.

The notify branch of `log()` re-entered the same `uiWarn`/`uiInfo`/`uiError`
method — which calls back into `log()` with the same `notifyLevel` — recursing
without bound and crashing the client with `RangeError: Maximum call stack size
exceeded` on **any** UI-notify log call. The notification now goes straight to
Foundry's notification manager (`ui.notifications`), and the two previously
unguarded `i18n.format` calls in `log()` are wrapped so a formatting failure
cannot throw out of the logger. (#267)
