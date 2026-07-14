---
"sohl": patch
---

**Fix `build-type-catalog.mjs` capturing a function's JSDoc instead of the class's (#234)**

`npm run docs:catalog` described the `skill` type with the `getFateDescTable`
**function** summary ("Returns the fate-test description table …") instead of the
`SkillLogic` **class** summary ("A trained capability with a mastery level").

The class-TSDoc regex used a non-greedy `[\s\S]*?` that started at the _first_
`/**` in the file and ran through the intervening code to the `*/` before
`class SkillLogic` — swallowing the earlier function JSDoc. The capture now
forbids `*/`, so it matches the `/**` immediately preceding the class.
`docs/reference/type-catalog.md` is regenerated with the correct `skill`
description (the only type whose Logic file carries an earlier function JSDoc).
