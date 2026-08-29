---
"sohl": patch
---

Repair a malformed shortcode by spelling its letters, not deleting them —
`Tabûri` now repairs to `Taburi` rather than `Tabri` (#1748).

`sanitizeShortcode` removed every non-alphanumeric character, accented letters
included, so a repair ate the letter instead of folding it: `Kûrbúl` became
`Krbl` and `Æthelred` lost its first letter entirely. It now carries the value
into ASCII with `toAsciiLetters` — the same fold `slugifyShortcode` already uses
— before dropping anything.

**Why this is not cosmetic.** `(type, shortcode)` is a _logical identity_, not
just a lookup key: it is what makes a world document recognizable as the same
entity as the compendium document it was imported from, and what archetype
shadowing, cohort membership, expression references, and `fvttFindItemByShortcode`
all resolve through. `Tabri` and `Taburi` name two different entities, so a
repaired document silently stopped matching its origin, with nothing recording
what the key had been.

**Where it was reachable.** Both call sites take input a user can supply — the
0.9.0 world migration that repairs legacy keys, and the create/update guard on
its `shortcodeDedupe` path. Inside that guard the old behaviour was also
self-inconsistent: an accented _shortcode_ was stripped while an accented _name_
falling through to the `slugifyShortcode` branch was folded, so the same input
came out spelled two different ways depending on the branch it took.

**Nothing else changes.** Folding is a no-op on an ASCII key, so the documented
punctuation repairs are untouched (`B&CFl` → `BCFl`, `self-pro` → `selfpro`), and
what the fold cannot carry into a letter or digit is still dropped
(`Kûrbúl ¾-Helm` → `KurbulHelm`). The output still always matches the shape rule.
No shipped content is affected: all 1,606 content notes already carry an
alphanumeric shortcode, and none of the 25 whose name holds a non-ASCII letter
uses the strip residue of that name as its key.
