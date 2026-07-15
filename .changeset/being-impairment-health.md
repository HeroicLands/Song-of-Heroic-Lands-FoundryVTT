---
"sohl": patch
---

**Being health: an impairment-based, banded assessment**

Resolves #470. SoHL has **no hit points**, so a being's health is a banded
assessment of capability — Excellent / Good / Fair / Poor / Morbid / Dead — read
off **impaired body parts**, not a points pool. An injury that impairs no part
has no effect on health.

- **Per-part impairment** (`bodyPartImpairment`) yields a **tier** — NONE / MINOR
  (−5) / SERIOUS (−10) / GRIEVOUS (≤ −11) — and a **`usable`** flag. Impairment is
  the worst-of {permanent impairment, each injury}, never additive; a grievous
  injury makes the part _unusable_ (no number), while permanent impairment tiers
  it but never unuses it. A `permanentlyUnusable` body-part field (a withered or
  amputated limb) also unuses it. `BodyPart` exposes `isCritical` (holds VITAL or
  CORE).
- **`BeingLogic.health`** is `{ value, max, band }`: `max` is always 100; `value`
  is the physical-impairment ceiling — bucket impaired parts by (critical?, state,
  count) and take the minimum — floored at 1 for a living being and 0 only when
  `dead`; `band` is the mapped label. The header shows the band label (with the
  `%` as a tooltip).

Fatigue, fear, and shock will later impose their own ceilings, composing by `min`
with this physical one.

Covered by unit tests (`bodyPartImpairment` tiers/usable/permanent,
`physicalHealthCeiling` table + worked examples, `healthBand`, `deriveHealth`,
`BeingLogic` health, `BodyPart` isCritical/permanentlyUnusable) and a
`being-header-health` e2e. The Being user-guide and `body-structure.md` document
the banded model.
