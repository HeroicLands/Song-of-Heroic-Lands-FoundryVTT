---
"sohl": patch
---

Make the skill drag handle work — skills reorder within their group (#1528).

Every skill row on the Being sheet's Skills tab rendered a grip handle, complete
with a hover treatment, and dragging one did nothing. The affordance advertised an
interaction the sheet did not provide, so it read as broken rather than absent.

Nothing was wired to those rows: `BeingSheet` registered drag selectors for
`.gear-list .item` and `.body-structure [draggable]` only, and the rows carried no
`draggable` attribute, so Foundry's `DragDrop` never bound and the browser never
started a drag.

**A drag never re-parents.** A skill's group is its `subType`, so a cross-group
drop clamps to the near edge of the skill's own group rather than moving it:

| Drop lands in…                    | Result                                    |
| --------------------------------- | ----------------------------------------- |
| a group **below** the skill's own | sorted to the **bottom** of its own group |
| a group **above** the skill's own | sorted to the **top** of its own group    |
| the skill's **own** group         | ordinary reorder at the drop position     |

Because every drop resolves to a defined position, the interaction cannot fail or
bounce — no drop target needs disabling and no rejection state exists, which is
why the drop selector is the whole tab rather than one group's ledger.

The rule lives in `resolveSkillReorder`, a pure Foundry-free helper in
`src/apps/logic/`, so it is exercised in Node rather than only through the DOM.
Writing it first surfaced a real trap: dropping a skill **onto itself** is not the
same as dropping it having missed every row. The latter means "the end"; collapsing
the two would have shunted a self-dropped skill to the bottom of its group.

**Skills now render in `sort` order.** `groupBySubType` was called without a
comparator, so groups rendered in raw collection order — which meant the `sort`
values a drag writes had no visible effect at all. Skills are now sorted stably by
`sort` with a name fallback, the same treatment the attribute score boxes already
get. Existing characters are unaffected: the sort is stable, so skills whose `sort`
values tie keep their present order.

A dragged group is renumbered whole rather than one row nudged, so `sort` values
stay evenly spaced instead of converging.
