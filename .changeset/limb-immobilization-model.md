---
"sohl": minor
---

Model limb immobilization separately from the ability to hold items
([#1269](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1269)).

A body part had one notion of being out of action, so anything that pinned a limb
would also have disarmed it. That would make a constricting hold a disarm, and
leave a Grab that takes what the hand is holding with nothing to take.

Being **immobilized** and being able to **hold** are now separate. `BodyPart`
carries one settable switch and two derivations, all Logic-only and rebuilt each
preparation cycle:

| Source                            | Sets          | Follows                                      |
| --------------------------------- | ------------- | -------------------------------------------- |
| **Immobilized** trauma            | `immobilized` | nothing — **the grip is retained**           |
| Grievous injury                   | `isUnusable`  | `immobilized`, and the loss of `canHoldItem` |
| `permanentlyUnusable` (persisted) | `isUnusable`  | the same, permanently                        |

```
isUnusable  = permanentlyUnusable || <set during the lifecycle>
immobilized = isUnusable || <set during the lifecycle>
canHoldItem = canHoldItemBase && !isUnusable
```

So `isUnusable` is the single switch for "this limb is out of action", and
`immobilized` is the weaker state a hold produces on its own. A grievous injury
sets one property and the rest follows; `BeingLogic.finalize` does that once the
traumas have settled their levels.

**A new Immobilized condition** — a `physcond` / `impediment` Trauma (shortcode
`immob`) — pins the limb owning the location it names, for as long as it exists.
It is an inspectable document on the character sheet, and deleting it frees the
limb on the next preparation cycle with nothing to unwind. A wrestler's grip and a
binding spell impart the identical condition, so a per-limb magical effect needs no
part-addressable Active Effect (which Foundry could not give it — body parts are
entities inside the Being, not documents).

**A grievous wound now drops what the limb was holding.** The rules promised it
and no code did it. The write happens once, at the injury event, rather than as a
lifecycle side effect — so re-preparation never re-drops, and an item the player
picks back up stays put.

**`BodyPart.canHoldItem` is now derived**, and every existing reader (the held-item
dropdowns, `limbsHolding` behind strike-mode gating) sees the effective answer. The
persisted capability is unchanged and still readable as `canHoldItemBase`.

Restricting which defences a Grab may be met with — a pinned limb answerable only
by Ignore — needs an `allowedDefenses` capability that does not exist yet, and a
Grab to use it; it lands with
[#1266](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1266).
