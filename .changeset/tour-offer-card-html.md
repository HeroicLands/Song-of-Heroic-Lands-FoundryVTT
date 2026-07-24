---
"sohl": patch
---

Fix the Character Creation tour-offer chat card so its body renders inline
`**bold**` and `_italic_` markup as HTML instead of showing the literal
`<strong>`/`<em>` tags. The card template escaped the already-localized content;
it now uses a raw (triple-stache) render like every other SoHL chat card. Closes
#654.
