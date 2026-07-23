---
"sohl": minor
---

**Model descriptive personality & physique traits as Trauma conditions**

Descriptive traits are conditions a being exhibits, not measured values, so they
now live under the Trauma document instead of the Trait document — the first step
toward retiring the Trait item entirely (only the measured physical-stat traits
remain).

- **New Trauma subtype** `PHYSICAL_CONDITION` (`physcond`), alongside the existing
  `PSYCHOLOGICAL_CONDITION` (`psycond`), each with its own category enum:
  `TRAUMA_PSYCOND_CATEGORY` (_Quirk_ / _Impulse_ / _Disorder_) and
  `TRAUMA_PHYSCOND_CATEGORY` (_Trait_ / _Impediment_ / _Debility_), with matching
  localization.
- **Nullable injury-only fields.** A Trauma's `levelBase`, `aspect`,
  `bodyLocationCode`, and `category` are now nullable (`initial: null`) so a
  descriptive condition can omit them; injuries are unaffected. The content
  compiler emits `null` for the omitted fields and now carries `category` through
  to the item.
- **Content migration.** The personality and physique trait content moves to
  `assets/content/Trauma/psycond` and `assets/content/Trauma/physcond` as
  `trauma` items — the old `intensity` becomes a `category` (personality
  `benign→quirk`; physique `benign→trait`, `impulse→impediment`,
  `disorder→debility`), and the descriptive `isNumeric`/`textValue`/`valueDesc`/
  `score` fields are dropped. The measured physical stats (Body Weight, Carrying
  Capacity, Favored Parts, Move, Size) stay Traits.

Closes #648
