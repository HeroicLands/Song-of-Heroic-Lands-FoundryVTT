---
"sohl": patch
---

**Improve with SDR: offer it for a _flagged_ item, and give it a card that shows its numbers**

The Skill Development Roll was offered by an inverted predicate and posted a chat
card whose two key numbers were blank. Both defects were shared by `SkillLogic` and
`MysticalAbilityLogic`, which run the same executor.

- **Visibility is no longer inverted.** _Improve with SDR_ appeared only while the
  item was **not** flagged for improvement and vanished the moment you flagged it —
  the reverse of the workflow the flag exists for, and unreachable for the action
  that _spends_ the flag as part of its outcome. The predicate now reads
  `itemLogic.canImprove && itemLogic.data.improveFlag`, in the shared action
  definition and in the matching `TEST_TYPE.IMPROVEWITHSDR` context-menu default, so
  the two cannot disagree.
- **The SDR posts its own card.** It rendered through `standard-test-card.hbs` under
  keys that template does not read (`effTarget` / `rollValue` vs.
  `mlMod.constrainedEffective` / `roll.total`), so **Target** and **Roll** came out
  empty and the card carried a GM result-edit pencil with an empty scope. An SDR is
  not a success test — it has no mastery-level modifier, no Fate, no success level,
  and nothing to re-evaluate — so it now renders `templates/chat/sdr-card.hbs`, which
  shows the roll total and the base mastery level it had to beat, and no pencil.
- **The card now actually posts.** Verifying the fix in a live world surfaced a third
  defect on the same payload: it carried a `type` key naming the item, and
  `SohlSpeaker._prepareChat` spreads card data straight into the `ChatMessage`,
  so that string became the message's **document subtype**. It is not a registered
  subtype, so Foundry rejected the create and the SDR card never reached chat at all
  — the roll resolved and persisted silently. The key is gone (no template read it),
  and `_prepareChat` documents the hazard.

The Skill and Mystical Ability user-guide pages record the flag precondition and drop
the corresponding known-gap notes.

Closes #1102

Closes #1103
