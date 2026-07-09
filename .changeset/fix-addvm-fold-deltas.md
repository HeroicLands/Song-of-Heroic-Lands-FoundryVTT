---
"sohl": patch
---

**Complete `ValueModifier.addVM` so it preserves the full modifier derivation**

`addVM` is meant to fold one modifier's justification into another — copying the
source's labeled deltas so the merged value keeps each source's tooltip and can
layer its own deltas on top. It was previously a stub that only copied the base
value and **silently dropped the source's deltas**.

It now replays every labeled delta from the source (name, shortcode, operator,
and value preserved, honoring same-shortcode replacement and `OVERRIDE`
semantics), while still adopting the source's base only when `includeBase` is set
(the base is not additive — a modifier has exactly one, so it is replaced, not
summed).

This corrects `MysticalAbilityLogic`'s mastery-level derivation, which used the
stub to borrow an associated skill's mastery level and therefore lost that
skill's own modifiers (e.g. injury impairment). It is also the mechanism the
upcoming combat-technique-as-skill work (#322/#323) uses to drive a technique's
strike-mode attack/defense from its skill.
