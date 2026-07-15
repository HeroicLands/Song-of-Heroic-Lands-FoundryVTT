---
"sohl": patch
---

**Fix the injury chat card failing to render**

`templates/chat/injury-card.hbs` closed its `{{#if needsShockRoll}}` block with
`{{/unless}}` instead of `{{/if}}`, so rendering threw `if doesn't match unless`
and no injury card was posted (aborting the Add Injury flow before the trauma was
recorded). (#283)
