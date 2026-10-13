---
"sohl": patch
---

**Rolls and afflictions**

- SimpleRoll formulas support arithmetic precedence, parentheses, and multiple dice groups, preserving saved rolls and chat results.
- Affliction duration formulas such as `(2d6)*86400` resolve to whole seconds and reject invalid results before changing onset or healing state.
- Content builds report malformed Affliction duration formulas at their source location using the same parser as runtime.
