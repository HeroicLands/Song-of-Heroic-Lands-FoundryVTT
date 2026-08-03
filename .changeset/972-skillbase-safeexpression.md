---
"sohl": minor
---

**Skill Base computed from a value-returning `SafeExpression`**

A skill's **Skill Base** (SB) is now computed by evaluating its
`skillBaseFormula` as a sandboxed `SafeExpression` instead of the bespoke
comma-DSL. The canonical HârnMaster reduction ships as an expression helper —
`sb(attr.str, attr.dex)` — so the common case stays a one-liner, while groups
that home-rule SB write the arithmetic themselves (multipliers, flat modifiers,
conditionals). Attribute **values** are exposed under an `attr.` namespace
(`attr.<shortcode>` → the attribute's effective score); an absent reference
resolves to `0` (a world-item skill, or an attribute the actor lacks), never an
error.

New global expression helpers: `sb(...values)` — 1 value → itself, 2 → average
rounded up iff the primary exceeds the secondary else down, 3+ → average rounded
to nearest (no clamp); and `birthsignBonus(birthsigns, code, amount)` — the
amount when `code` is among the actor's birthsigns, else `0`. Birthsign bonuses
now **stack** (sum multiple terms) rather than applying largest-only.

An **invalid formula** (syntax error, unknown helper, non-numeric result) is now a
visible, actionable state rather than a silent `0`: the internal SB falls back to
`0`, the Being sheet's SB cell shows an ✕, and the Skill item sheet shows
`Invalid expression: <message>` next to the formula field. The
Aura-in-formula → fate-disabled rule is preserved via an AST walk
(`SafeExpression.attrRefs()`) rather than a regex.

All 65 shipped skill formulas were converted to the new syntax with identical
computed SB (pre-Beta — no world migration).

Closes #972
