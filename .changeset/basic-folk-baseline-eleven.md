---
"sohl": patch
---

Put Basic Folk on the baseline the injury model is calibrated to
([#1249](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1249)).

`BASE_INJURY_THRESHOLDS` says the master table is "calibrated for a baseline
human body (STR ≈ 11)", and the body-scale rule divides by 11 for the same
reason — but Basic Folk, the actor that exists to _be_ that baseline, carried
every attribute at 10. Its body scale only read 1.0 because `bodyScaleBase` was
hard-coded to 1 rather than derived like every creature's.

Every attribute is now 11, so a body scale of 1.0 falls out of `STR ÷ 11`
instead of being asserted. Its twenty-seven embedded skills derive their Skill
Base from the attributes and move with it, and body weight — a
`(9 × str) + 50` expression — goes from 140 to 149 lb, which brings it into
agreement with the 68 kg its own descriptive traits already claimed.
