---
"sohl": patch
---

**Fix SVG icons rendering invisible when the OS appearance and Foundry theme disagree**

The bundled icons are `<img>`-embedded SVGs whose fill follows a build-injected
`@media (prefers-color-scheme: dark)` swap, which resolves from the element's used
CSS `color-scheme`. Foundry stamps `color-scheme` from _its own_ UI theme onto the
enclosing chrome, but SoHL's sheet surface themes from the OS — so whenever the two
disagreed (e.g. an OS-dark viewer running Foundry's light theme), the icon fill
matched the wrong scheme and portrait / ledger icons rendered **invisible** on the
first render, only reconciling after a theme toggle.

SoHL's own scoped surfaces now pin `color-scheme` to the same OS / `[data-theme]`
signal their colour tokens already use (`light dark` on `.sohl`, `light` on
light-locked surfaces such as chat cards and the print view), so `<img>` icon fill
and the vellum ground always agree. The pin is scoped to `.sohl` — never `:root` —
so Foundry's own windows and the compendium keep following Foundry's theme, where
the icons correctly track the themed chrome they sit on.

Closes #917
