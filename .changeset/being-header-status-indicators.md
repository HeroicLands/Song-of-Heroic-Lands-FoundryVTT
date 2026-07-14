---
"sohl": patch
---

**Being sheet header: Aural-Shock and Fatigue as affliction-derived indicators**

Resolves #306 (header scope: status toggles). The header's status roster now
distinguishes toggleable ActiveEffect statuses from affliction-derived
indicators:

- Six pills — Sleep, Prone, Stun, Incapacitated, Unconscious, Dead — remain
  click-toggleable (`toggleStatus` → `Actor#toggleStatusEffect`).
- **Aural-Shock and Fatigue** are now read-only indicators, lit when the actor
  has an active affliction of that subtype (`level.effective > 0`), matching the
  prototype (which drove them from afflictions, not statuses; Fatigue is not a
  `STATUS_EFFECT`). They render as non-interactive pills
  (`.sheet-header__status--indicator`).

The health bar and per-body-part status grid — which need derived data that does
not exist yet — are split out of #306 into their own issues (populate
`BeingLogic.health`; derive per-part injury status) and are not part of this
change.

Covered by `buildStatusPills` unit tests (roster order, toggleable vs indicator,
affliction-vs-status lighting) and a `being-header-status` e2e (Prone toggles on
click; the Fatigue indicator lights read-only from an active affliction).
