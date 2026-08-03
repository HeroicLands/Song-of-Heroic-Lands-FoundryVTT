---
"sohl": patch
---

**Remove orphaned damage / strike-mode dialog templates**

Deleted `templates/dialog/damage-dialog.hbs` and
`templates/dialog/strike-mode-dialog.hbs`. Both were pre-TypeScript-rewrite
leftovers, referenced by no `renderTemplate` call, dialog builder, or preload
glob, and their entire template context (`const.ASPECTTYPES`, `const.IMPACTDICE`,
`const.ZONEDICE`, `const.PROJECTILETYPE`, `askImpact`, `impactAspect`) exists
nowhere in `src/`. The reported dead aspect `<select>` (iterating the undefined
`const.ASPECTTYPES`) was a symptom of the whole template being unwired, not a
binding to repair — so the templates are removed rather than pointed at a
context that does not exist. Editing damage / strike-mode values remains a
future feature that would ship its own dialog and context builder.

Closes #952
