---
"sohl": minor
---

**Restore the Being sheet header: clickable status pills, health bar, body-location lozenges**

Rebuild the Being sheet header to match the previous design, in `templates/actor/being/header.hbs`, `scss/layout/_sheet.scss`, and `src/document/actor/foundry/BeingSheet.ts`:

- **Status pills** now look like the old rounded lozenges (grouped top-right, wrapping) and are **clickable to toggle** the status — a new `toggleStatus` action calls `actor.toggleStatusEffect(statusId)`, creating/deleting the active effect. Active pills are highlighted.
- **Health bar** restored: a labelled, filled bar in the header (added `healthPct` to the header context).
- **Body-location lozenges** restored as a read-only, full-width row beneath the main header, generated dynamically from the actor's Lineage body structure (`bodyStructure.parts`).

Status `data-status-id`/tooltips and localization keys are unchanged.
