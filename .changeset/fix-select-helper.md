---
"sohl": patch
---

Fix seven dialog templates failing to render on Foundry v14.

Foundry v14 removed the `{{#select}}` Handlebars block helper, so the injury,
damage, missile-damage, opposed-response, create-item, strike-mode, and
query-weapon dialogs threw `Missing helper: "select"` and never opened. Each
select is converted to the supported v14 pattern: `{{selectOptions}}` (with
`valueAttr`/`labelAttr` for object lists), or an inline `{{#each}}` with
`{{#if (eq …)}}selected{{/if}}` where the option value or label can't be
expressed through `selectOptions` (string lists and formatted labels like `dN`).
This also repairs the Add Injury flow end to end (its dialog can now render). (#280)
