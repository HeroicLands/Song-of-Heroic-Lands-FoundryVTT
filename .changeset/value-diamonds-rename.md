---
"sohl": minor
---

Rename Success Stars to Value Diamonds, and the result table to `resultDescTable`
([#1283](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1283)).

The quality grade of a Success Value test is now **Value Diamonds**. It was
"Success Stars", which collided with **Victory Stars** — an unrelated quantity.
The two measure different things: Victory Stars is the unbounded difference
between two positions on the success-level ladder, while Value Diamonds is a
bounded 0–5 grade on the Success Value scale. Neither is a measure of _success_
in the other's sense, and sharing the word "Star" invited exactly the confusion
the Victory Star naming was introduced to remove.

**What changed**

| Was                | Now               | What it is                                    |
| ------------------ | ----------------- | --------------------------------------------- |
| `successStars`     | `valueDiamonds`   | The 0–5 quality grade of a Success Value test |
| `successStarTable` | `resultDescTable` | The generic result-description table          |

The table rename fixes a second, quieter problem: `successStarTable` never held
star data. It is the `LimitedDescription[]` that fate, keep-control, afflictions
and plain Success Value tests all ride on, supplying a label, a description and a
numeric result — and that number only means "diamonds" for one of those
consumers. The developer documentation already called the mechanism
"result-description tables"; the code now agrees.

**Compatibility**

Localization keys are unchanged — only their values. Both legacy keys are still
accepted on read, so chat cards already sitting in a world's log reconstruct
unchanged, and a house rule or macro passing `scope.successStarTable` keeps
working. Serialization now emits the new names only.

The grade still displays as a count from zero to five, not as icons, exactly as
before. Victory Stars are untouched.
