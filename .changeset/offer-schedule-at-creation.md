---
"sohl": minor
---

**Offer to schedule a wound's healing check at creation, instead of auto-arming**

Creating an injury no longer silently arms its healing check — the last spot where
a timed effect scheduled itself without a human (issue #579, completing the
offer-to-reschedule work). When a wound is recorded, the system now **offers** to
track its healing: a dialog (default **Schedule**, showing the rolled cadence —
"in 5 days") shown to the player who took the wound, on their own client. They hit
OK to track it, adjust, or decline.

- **A dialog, not a card — because the responder is _me_.** The chat-card
  `[Perform]` buttons exist for a response deferred to later or to someone else; a
  choice the acting human makes here and now (I just took this wound) is a dialog.
- **No auto-arm at creation.** `TraumaDataModel._preCreate` seeds only the config
  (contract date, the cadence formula/base); `createTraumaFromInjury` then calls
  the shared offer. Both `createInjury` paths (automated aim, assisted dialog)
  forward their context, so a scripted/bulk caller can pre-answer via
  `scope.schedule` or suppress with `skipDialog` — but the interactive path prompts.
- **The offer helper is generalized.** `offerReschedule` → **`offerSchedule`**
  (same mechanism serves the first schedule and the re-schedule); its dialog now
  leads with **Schedule** as the default and shows the interval, so accepting is a
  single OK. Lang keys `SOHL.Reschedule.*` → `SOHL.Schedule.*`.

Scope: this covers the injury **healing check** (the player-facing flow).
Blood-loss / lasting-condition course / affliction onset still auto-arm at creation
for now — separate follow-ups.

Refs #579.
