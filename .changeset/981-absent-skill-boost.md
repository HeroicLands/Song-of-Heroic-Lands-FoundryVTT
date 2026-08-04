---
"sohl": minor
---

**Boost Mysteries can confer a skill the character doesn't have**

A Boost Mystery whose associated skill is absent from the character now offers to
add that skill so the Boost has something to act on — completing the other half of
the Boon/Boost feature.

- When a Boost is **dropped onto an actor** and names a skill the actor lacks, a
  dialog offers to add that skill (resolved from the world or a compendium by its
  shortcode) as a real, **unlearned** skill at mastery level 0. Nothing happens
  without that consent; a shortcode that matches no skill is reported, not added.
- Once present, the Boost **opens the unlearned skill at its Skill Base** and
  compounds the remaining boosts (per the Mastery Boost table), so it renders and
  rolls like any other skill. A Boost with `N = 1` confers the skill at exactly its
  Skill Base.
- The conferred skill is an ordinary embedded skill, not a temporary one: if the
  Boost later lapses it simply sits at mastery level 0 until its owner deletes it —
  there is no hidden state to unwind.

Because an embedded Mystery picks its associated skill from the actor's own skills,
this absent-skill case only arises from a world/compendium Boost dropped onto an
actor — which is exactly where the offer appears.

Closes #981
