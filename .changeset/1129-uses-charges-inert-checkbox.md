---
"sohl": patch
---

**Mystical Ability / Mystery: remove the unlabelled, inert "uses charges" checkbox**

The **Charges** fieldset on both item sheets led with a checkbox bound to
`system.charges.usesCharges`. It rendered with no label at all, and nothing in the
system ever read it — whether an item consumes charges has always been decided by
**Maximum Charges** alone (`null` = does not use charges, `0` = counted but
uncapped, a positive number = a real cap).

- **Dropped `charges.usesCharges`** from `MysticalAbilityDataModel` /
  `MysteryDataModel`, from both logic `Data` interfaces, and from the two
  properties templates. A pre-Beta clean break — the flag carried no meaning, so
  there is nothing to migrate.
- **Made the surviving hints carry the meaning.** The **Maximum Charges** hint now
  states plainly that a blank value means the item does not use charges and `0`
  means no limit. (The Mystery hint previously said blank meant "no limit", which
  was wrong; the Mystical Ability hint exposed the raw `null`/`0` schema jargon.)
- **Fixed shipped content, which claimed uncapped charges.** The pack builder
  coerced an absent maximum to `0`, so every compendium Mystery and Mystical
  Ability except Fate shipped as an uncapped charge-user and displayed `0/∞`
  instead of ✕ on the Being sheet's Mysteries tab. A new `resolveCharges` builder
  helper preserves `null`, and the authored content declares charges only where
  they are actually used.

Closes #1129
