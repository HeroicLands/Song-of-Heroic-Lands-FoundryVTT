---
"sohl": patch
---

**Fix the Being create-dialog default archetype (was an empty "Giraffe")**

Creating a Being from the Create dialog now defaults to the **Basic Folk**
character template — a fully-populated being with a body, attributes, and
movement — instead of "Giraffe", an empty-bodied creature that happened to win by
the UUID tiebreak.

All shipped beings (236 creatures + the character templates) are flagged as
archetypes at the default priority `0`, and all but Basic Folk have a blank
shortcode, so none deduped and the default fell to whichever candidate sorted
first by UUID. Basic Folk is now flagged at priority `1` (`sohl.archetype: 1`), so
it deterministically wins the create-dialog default while every other being stays
available in the picker. The archetype marker is still preserved verbatim by
Import/Duplicate — its value is now `1` rather than `0`.

Closes #760
