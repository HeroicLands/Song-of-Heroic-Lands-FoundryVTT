---
"sohl": patch
---

**Fix chat cards being illegible in dark mode**

Chat cards now carry their own theme-aware parchment ground, so card text stays
readable in both light and dark mode.

Foundry paints each chat message on a _fixed-light_ parchment and pins the chat
log to `theme-light`, but SoHL's design tokens follow the OS / `data-theme`
swap. The card owned an adaptive ink color but no background of its own, so in
dark mode the cream dark-mode ink landed on Foundry's always-light ground —
light-on-light, and the body text and result labels all but vanished.

`.chat-card` now paints SoHL's parchment texture over the `--sohl-color-bg-sheet`
paper token with `background-blend-mode: multiply` — the same self-contained
surface treatment the sheets use — so the card ground follows the palette (light
vellum in light, dark vellum in dark) and always matches its ink. Chat-card
buttons gain an adaptive foreground and background too, so they stay legible on
the now-dark card ground (Foundry's default button color is a fixed dark that
would otherwise disappear). The fix keys off the unscoped `.chat-card`, so it
covers every card root — `sohl`, legacy `hmk`, and bare.

Closes #899
