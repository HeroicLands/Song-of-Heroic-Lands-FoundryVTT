---
"sohl": patch
---

**Nine mystical-ability notes no longer author the retired `assocMysteryCode`
field.** `MysticalAbilityDataModel` has not declared it since #973 removed it as
dead plumbing, so Foundry discarded the key when the compendium item was
constructed — silently, with nothing at compile or load time to tell an author
that what they wrote had no effect.

The value was `""` in all nine notes (_Alchemy_, _Talent_, _Astrology_, _Fate_,
_Runecraft_, _Tarotry_, _Spirit_, _Summoning_, _Trance_), so no association is
lost by dropping the key.

`assocMysteryCode` was **not** renamed to `assocAffiliationCode`, despite the two
looking alike. #973 deleted the mystery link because nothing read it; #1012 later
added the affiliation link as a separate concept — the faction whose standing
confers the ability, not the mystery it draws on. A note that wanted to express
an affiliation would have to say so deliberately, and none of these does.

The pack builder still emits a default `assocMysteryCode` of its own, which is
tracked and fixed separately as HeroicLands/package-build#35; the compiled packs
are therefore unchanged by this alone.
