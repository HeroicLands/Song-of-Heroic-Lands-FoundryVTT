---
"sohl": patch
---

**Actions tab: show each action's icon, and disable the ones that would refuse**

The **Actions** tab on an actor or item sheet listed every action with a blank icon
box and a live ▶, even for actions the system would refuse.

- **Rows render their own icon.** The ledger emitted `<img src="{{action.data.img}}">`,
  but actions carry no image — they declare an `iconFAClass` (the same glyph the
  context menu draws). Each row now renders that glyph, falling back to the schema's
  placeholder when an action declares none.
- **A gated action reads as gated.** An action whose `trigger` currently refuses it
  (an uncarried item's gear actions, say) is drawn disabled, with a tooltip naming
  the reason — "The item must be carried before this action can be used" — instead of
  an enabled ▶ that silently does nothing. Clicking one anyway reports the refusal
  rather than failing quietly.
- **New seam:** `SohlAction.isAvailable` / `unavailableReason` answer "would this run,
  and if not, why?" against the action's own documents, and an intrinsic definition
  may declare a `disabledReason` i18n key. The gear carried gate labels every action
  it gates, so the behavior is uniform across gear types rather than special-cased.

Both sheets now build their Actions tab from one shared helper, so the actor and item
tabs list and gate actions identically.

Closes #1135
Closes #1136
