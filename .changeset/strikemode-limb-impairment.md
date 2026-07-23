---
"sohl": minor
---

**Strike-mode required-limb impairment gates the roll (#628)**

Complete the Injury rules' _Indefinite Impairment_ consequences for weapon strike
modes — the per-part counterpart to the role-based skill/attribute gating shipped
in #568. A strike mode names the limbs it needs by count (`minParts`), not by
role, so it carries no `impairedByRoles`; instead the gating now resolves the
_specific_ body part(s) holding the weapon and scores each through the being's
body-part impairment:

- A strike-mode attack/defense test whose **required (held) limb is unusable** — a
  grievous injury or a permanent-unusable flag — resolves as an automatic Critical
  Failure, reusing the existing `SuccessTestResult.autoCriticalFail` flag.
- The same limb, when **impaired but still usable**, imposes its **−5** (minor) /
  **−10** (serious) penalty on the mode's attack/defense mastery level. When a test
  is gated on both a role and a held limb, the worst (most negative) of the two
  applies — never their sum.

Plumbing only, no new outcome logic:

- Foundry-free `requiredPartsAutoCriticallyFail` / `requiredPartsImpairmentPenalty`
  — the per-part twins of `testAutoCriticallyFails` / `testImpairmentPenalty`.
- `BeingLogic.bodyPartImpairments(parts)` — the per-part impairment view (as
  opposed to the role-aggregated `unusableRoles` / `impairedRolePenalties`).
- `GearLogic.heldLimbImpairments` — the impairment of the limb(s) currently
  holding the item, resolved from `heldBy`.
- `MasteryLevelModifier.successTest` folds the held-limb result into the same
  auto-CF / penalty seam as #568. A strict no-op for a parent that holds nothing
  (a skill, attribute, or unheld item).

Natural-weapon (combat-technique) strike modes continue to gate through their
skill's `impairedByRoles` (#568); a per-part link from a natural weapon to its
body part does not exist yet and remains a follow-up.
