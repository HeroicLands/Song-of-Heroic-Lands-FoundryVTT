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

The old names are removed outright — there are no aliases. No DataModel field
changed (the generated type catalog is untouched), so no world migration is
needed and persisted actor/item data is unaffected. Localization keys are
unchanged; only their values were reworded, so no key was renamed or retired.

The one thing that does not survive is a **chat card posted before this
release**. The serialized test result rides inside the card's `data-scope`, so
pressing a button on an older card reconstructs a result with no description
table: its Result row reads empty and its grade reads zero. Nothing is corrupted
and nothing is applied silently — a treatment card's Course Bonus, for instance,
is still confirmed in a dialog before it takes effect. Re-run the test to get a
current card.

**Display**

The grade is now drawn as **diamond icons** rather than a bare number. Because
the scale has a fixed ceiling of five, the card draws all five and fills the
earned ones, so the row reads as a rating; a contest margin is unbounded, so
Victory Stars still draws only the stars actually earned. The count remains
available to screen readers via `aria-label`.

Victory Stars are otherwise untouched.
