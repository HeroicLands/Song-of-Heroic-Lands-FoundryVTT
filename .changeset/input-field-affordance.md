---
"sohl": patch
---

**Give input fields a clear resting affordance and drop red as an interaction cue**

Editable inputs, selects, and textareas now show a resting affordance so it is
obvious where input is accepted: a subtly filled "well" (the warm
`--sohl-color-bg-input-active` tan, offset from the parchment), a 1px border, a
small radius, and a faint inset shadow. Previously fields were transparent at
rest and blended into the sheet background — the only cue appeared on hover.

Active versus inactive is now unmistakable. A **readonly** or **disabled** field
renders flat — transparent background, no border, muted text — so it reads as
display-only and is visibly distinct from an editable well.

Interaction cues are consistent across the app and no longer use **red**, which
reads as an error/danger signal. A focused field gets a conventional blue focus
ring (`--sohl-color-focus-ring`) instead of the former red glow, and the red
hover glow on rollable elements and chat headers is replaced with the same accent
blue.

Closes #757
