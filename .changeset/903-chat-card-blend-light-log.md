---
"sohl": patch
---

**Chat cards blend into Foundry's always-light chat log**

Foundry pins the chat log to light in both light and dark mode — every message is
painted on a fixed-light `/ui/parchment.jpg` and the message frame is not the
system's to theme. The previous fix themed only the card interior, so in dark mode
a dark vellum card floated inside Foundry's light-grey frame (and sat
inconsistently next to Foundry's own light system cards).

The card now `light-lock`s its `--sohl-color-*` tokens and drops its own parchment
ground, so it inherits Foundry's light message ground and stays stable in both
modes: legible dark ink, with SoHL's identity carried by typography (small-caps
titles, ruled bands, rubric-red pass/fail) rather than a ground texture that flips.

Closes #903
