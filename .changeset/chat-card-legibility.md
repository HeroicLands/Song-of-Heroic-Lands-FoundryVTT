---
"sohl": patch
---

**More legible chat/result cards**

Chat cards now read with the bold, high-contrast character of the earlier cards.
Body text switches from the light Cormorant Garamond display serif (weight 400) to
**Signika at weight 500**, so labels and values carry more ink; the success/failure
result text and colored roll values are now **bold**, so the saturated red/green
hues no longer read as washed-out pastels. The card body also owns an adaptive
`text-primary` color, keeping labels and values legible in **dark mode** (they
previously fell back to default black and were nearly invisible on the dark
surface).

Closes #895
