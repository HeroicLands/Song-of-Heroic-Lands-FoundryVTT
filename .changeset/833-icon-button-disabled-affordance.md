---
"sohl": patch
---

**Fix: disabled sheet controls now read as disabled; the name-edit pencil is always visible**

On a read-only Being sheet — for example an actor opened straight from the locked
`sohl.actors` compendium — Foundry disables every form control, buttons included.
The shared `.icon-button` component had no disabled style, so a disabled button
looked identical to a live one (same ink glyph, same `pointer` cursor) yet
silently swallowed clicks — making a control that Foundry had correctly disabled
look broken instead. Disabled icon-buttons now read as disabled: a muted glyph, a
`not-allowed` cursor, and no hover affordance (opacity before hue, per the token
rule).

The header **edit-identity pencil** compounded the confusion by being invisible
until the identity row was hovered. It is now always present but low-emphasis at
rest — discoverable, and reachable on touch and by keyboard — brightening to full
on hover or focus, and staying dimmed when the sheet is read-only.

No template, data-model, or handler change; the `editIdentity` action itself was
never broken.

Closes #833
