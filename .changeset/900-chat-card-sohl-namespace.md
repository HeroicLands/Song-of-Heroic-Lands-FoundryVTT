---
"sohl": patch
---

**Normalize chat-card template roots to the `sohl` namespace**

Every chat-card template under `templates/chat/` now uses a `sohl chat-card` root
element. Previously the roots disagreed: 16 used the legacy `hmk chat-card`, 4 used
a bare `chat-card` with no namespace, and only 3 used the current `sohl chat-card`.
The `hmk`/bare cards silently missed the `.sohl`-scoped styling (`base/_elements`
button treatment, the `.sohl` Foundry-core variable remaps), so their theming
depended on whatever unscoped `.chat-card` rules happened to exist — a latent
source of light/dark and control-styling drift.

With every root normalized, card-wide styling can live under `.sohl` scope
consistently. Cards render identically before and after: the card interior is
driven by the intentionally _unscoped_ `components/chat` rules (which already
covered all three variants), the newly-applying `.sohl button` treatment mirrors
the existing `.chat-card button` rule, and no card template contains the form
inputs the other `.sohl`-scoped element rules target.

Closes #900
