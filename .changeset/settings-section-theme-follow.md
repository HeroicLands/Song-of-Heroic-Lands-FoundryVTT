---
"sohl": patch
---

Fix the branded "Game System" section in the Game Settings sidebar reading
illegibly against the sidebar ground, and center its links (#931).

The section is Foundry chrome whose ground is painted by _Foundry's_ interface
theme (`theme-light` parchment / `theme-dark` near-black), but it was coloured
with `--sohl-color-*` tokens that follow the _OS_ `prefers-color-scheme`. When
the two disagreed the text mismatched the ground — a Foundry-dark sidebar under
an OS-light preference rendered near-invisible dark ink on black.

The palette now tracks Foundry's theme class instead (light tokens under
`theme-light`, dark under `theme-dark`, via `light-lock` / `dark-lock`), so the
text and the `<img>` emblem always contrast the sidebar ground and follow a live
theme toggle. The inline links are also centered (separated by whitespace).
