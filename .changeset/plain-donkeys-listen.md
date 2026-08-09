---
"sohl": patch
---

**The twelve Astrokýklos cusp birthsigns now ship as content** ([#1235](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1235))

The wheel has twenty-four signs, not twelve: between each pair of consecutive principal signs lies a **cusp**. A character born on a threshold now has a sign to attach.

Each cusp is a droppable Mystery (`other`) built exactly like a principal sign — one Active Effect per non-zero element, adjusting the Effective Mastery Level of that element's skills:

| Cusp             | earth | metal | fire | air | spirit | water |
| ---------------- | ----- | ----- | ---- | --- | ------ | ----- |
| Arnos-Bourax     | +15   | +10   | 0    | -10 | -5     | +5    |
| Bourax-Diplos    | +10   | +15   | +5   | -5  | -10    | 0     |
| Diplos-Chelyx    | +5    | +15   | +10  | 0   | -10    | -5    |
| Chelyx-Thyron    | 0     | +10   | +15  | +5  | -5     | -10   |
| Thyron-Korith    | -5    | +5    | +15  | +10 | 0      | -10   |
| Korith-Stathmos  | -10   | 0     | +10  | +15 | +5     | -5    |
| Stathmos-Kentros | -10   | -5    | +5   | +15 | +10    | 0     |
| Kentros-Belos    | -5    | -10   | 0    | +10 | +15    | +5    |
| Belos-Tragyx     | 0     | -10   | -5   | +5  | +15    | +10   |
| Tragyx-Nalos     | +5    | -5    | -10  | 0   | +10    | +15   |
| Nalos-Opsar      | +10   | 0     | -10  | -5  | +5     | +15   |
| Opsar-Arnos      | +15   | +5    | -5   | -10 | 0      | +10   |

`tests/content/birthsign-effects.test.ts` now asserts all twenty-four rows against the authored content, so a cusp that drifts from the matrix — or whose `test` expression stops parsing — fails there rather than silently applying nothing in play.
