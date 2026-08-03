---
"sohl": minor
---

**Mark experimental (fenced) document types across the UI**

For the scoped beta, the document types whose schema is still moving — the
**Cohort**, **Structure**, and **Vehicle** actors — are now visibly marked as
experimental so testers don't build campaigns on schemas that may still change
without an automatic migration. Everything is driven from a single `FENCED_TYPES`
source of truth so the surfaces can't drift:

- **Create dialog** — fenced actor types are suffixed with **(Experimental)** in
  the type picker. They stay selectable (labelled, not hidden), so testers can
  still create and exercise them.
- **Sheet banner** — fenced actor sheets render a dismissible _"Experimental —
  schema not final"_ notice above the header. Dismissal is per-view: the caution
  returns next time the sheet is opened, because the schema really isn't final.
- **README** — a Ready-for-play vs Experimental status table documents which types
  are frozen and which are still evolving.

Mystery and Mystical Ability graduated into the frozen subset and are **not**
fenced; the region-behavior `trigger` is GM-only and automated attack is a flow,
not a creatable type, so neither is labelled here.

Closes #959
