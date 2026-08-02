---
"sohl": patch
---

**Attribute cards: centered content, six across**

The Being sheet's **Profile → Attributes** score cards now center their contents
(name, score value, descriptor, and TL line) and are sized to sit **six across**.
The container's `auto-fill` track — which produced variable, oversized cards — is
replaced with a pinned six-column grid, matching the `grid-6col` layout the markup
already declared. The ⋮ context-menu control moves to the card's top-right corner
so the centered name never pulls off-center.

Closes #922
