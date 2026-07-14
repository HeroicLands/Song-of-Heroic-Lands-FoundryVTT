---
"sohl": patch
---

**Being sheet header: per-body-part injury status grid**

Resolves #464. The header's body-part grid now shows each part's derived
impairment, colored by severity, instead of a bare shortcode list.

- **Impairment derivation** (`bodyPartImpairment`, `src/entity/body/impairment.ts`
  — pure and Foundry-free): a part takes the **most serious** injury across its
  hit locations — grievous (`G4`/`G5`) → **unusable**, serious (`S2`/`S3`) →
  **−10**, minor (`M1`) with healing rate ≤ 5 → **−5** — and eases back
  `unusable → −10 → −5 → none` as wounds heal. A **permanent impairment** acts as
  a non-positive floor.
- **Header grid**: each part renders by **name** (with a stable `data-shortcode`)
  and a status class colored per the rules — none = white, −5 = yellow, −10 or
  worse = blue, unusable = black.
- `BodyPart` now surfaces its `name` (mirroring `BodyLocation`), which the grid
  and other callers can use.

The derivation is shared, so the health work (#463) can consume the same per-part
status for its ceilings. Permanent impairment has no persisted field or UI yet
(the parameter defaults to `0`); wiring a source for it is a follow-up.

Covered by `bodyPartImpairment` unit tests (severity bands, worst-injury,
permanent floor), updated `buildBodyPartLozenges` tests, and a
`being-header-bodyparts` e2e (a grievous injury colors its part unusable; a
slow-healing minor injury colors it minor; an uninjured being is all-none).
