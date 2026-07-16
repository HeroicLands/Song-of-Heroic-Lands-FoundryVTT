---
"sohl": patch
---

**Restore the Being Profile attribute cards (#507)**

Attributes rendered as loose unstyled text because the template emits
`.attribute-score__*` BEM classes while `_profile.scss` still targeted the
pre-rename `.attribute`/`.value`/`.label`. The card styling is re-keyed on the
BEM classes — a dense six-column grid of compact bordered cards (name + ⋮
header, large bold score, descriptor, and a `TL:` footer).
