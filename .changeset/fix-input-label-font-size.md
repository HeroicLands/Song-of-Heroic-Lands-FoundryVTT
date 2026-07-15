---
"sohl": patch
---

**Bump the `input-label` typography token from 14 px to 16 px**

All other body and label tokens were already at 16 px; the `input-label`
entry in `scss/abstracts/_typography.scss` was the only one still at 14 px,
causing form field labels to render noticeably smaller than the rest of the
UI text.

Closes #112.
