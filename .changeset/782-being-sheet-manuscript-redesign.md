---
"sohl": minor
---

**Being sheet: the Manuscript redesign**

The Being sheet is rebuilt on the Manuscript visual design — a cohesive
parchment-and-ink treatment shared across all ten tab templates, backed by a new
SCSS component foundation (ledger, section-legend, status-pill, body-lozenge,
health-bar, chip, disclosure, drag-grip, icon-button, add-button) and per-tab
`apps/`-layer styles.

**Header.** The identity row shows the name and shortcode as read-only text with
an edit pencil (revealed on hover) that opens a single _Edit Identity_ dialog for
name + shortcode together, replacing the inline name input. A health ramp
(green → gold → red) drives both the band word and the bar fill; status effects
render as toggleable pills with read-only affliction indicators; body parts show
as impairment-colored lozenges.

**Profile.** Now hosts the editable **Body Structure** tree (Zone → Part →
Location) — collapsed by default with an expand/collapse-all toggle and per-node
disclosure, owner-gated add / drag-sort / context-menu authoring, plus attribute
score cards and an _Add Movement Profile_ control. The Combat tab keeps a
read-only, flat armor-reference table of the same locations.

**All tabs** move to the shared `ledger` row/cell structure with `section-legend`
subtype headers, and adopt **present-only hiding** (`{{#if …length}}`): empty
subtype groups are not rendered. One consequence: the always-visible empty
_Combat Technique_ section from #714 no longer shows for a being with none
(creation is still reachable via the tab's global _Add Skill_ footer) — tracked
in #797.

Stable JS hooks and `data-*` attributes are preserved, so actions, drag/drop,
context menus, search filters, and the character-creation tour continue to work
against the new markup.

Closes #782
