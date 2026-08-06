---
"sohl": patch
---

**Vehicle, Structure, and Cohort sheets render every tab, not just Façade**

Selecting any tab but **Façade** on one of these sheets showed an empty panel: the
tab switched, but its body was never in the DOM. The actions existed on the actor
and the templates existed on disk — there was simply no way to reach them from the
sheet.

- **Render parts are derived from the sheet's declared `PARTS`.** The base actor
  sheet hard-coded its render list to `header` / `tabs` / `facade`, discarding
  everything each concrete sheet declared; only the Being sheet restated its own
  parts, so only the Being sheet showed them. The list is now derived (in
  declaration order), so a sheet gets a tab body by declaring it. The
  experimental-schema banner and the limited-permission rule are applied by the
  same derivation.
- **The shared tab behavior moved to the base sheet.** The Gear, Actions, and
  Effects tabs are the same tabs on every actor type, so their context builders,
  their controls (add / edit / delete gear, carry, wear, and the action controls),
  and the item and effect context menus now live on the base actor sheet rather
  than on the Being sheet alone. The header and Façade contexts are prepared for
  every actor type too — the Vehicle, Structure, and Cohort headers previously
  rendered a blank name and portrait.
- **Gear capacity reads correctly per type.** A Being's Gear tab still reports
  carried weight and encumbrance; a Vehicle or Structure, which is not encumbered
  by its load, reports the total weight of its cargo or stores.

The Cohort's **Members** tab renders its section but does not yet list members,
and the Cohort has no shared-gear tab; both are tracked separately.

Documentation: the Gear, Actions, and Effects tabs are now documented once, in
_Understanding Sheets_ under **Common Actor Tabs**, with the Being, Vehicle,
Structure, and Cohort pages linking there instead of each restating them.

Closes #1088
