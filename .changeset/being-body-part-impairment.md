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
- **Permanent impairment** is a new per-body-part `permanentImpairment` field on
  the Being body model (a manually-set, non-positive integer floor; `0` = none).
  It is additive with a safe default, so existing beings need no migration. No
  dedicated editor UI yet — it is set via a data update; a sheet control is a
  follow-up.

The derivation is shared — the being's health assessment reads the same per-part
impairment.

Covered by `bodyPartImpairment` unit tests (severity bands, worst-injury,
permanent floor), updated `buildBodyPartLozenges` tests, and a
`being-header-bodyparts` e2e (a grievous injury colors its part unusable; a
slow-healing minor injury colors it minor; an uninjured being is all-none).
