---
"sohl": patch
---

**Sheet row context menus: restore the `itemLogic` binding, and label two sheet fields**

Three sheet defects reported from the same verification pass.

- **Row ⋮ menus lost every action whose predicate names `itemLogic` (#1132).** A
  context-menu predicate resolves `itemLogic` / `actorLogic` by walking up from the
  clicked element to the nearest `[data-item-id]` / `[data-actor-id]` ancestor — but
  **no sheet emitted `data-actor-id`**, so the item lookup (which goes through the
  resolved actor) always came up empty. `itemLogic` was permanently `undefined` and
  the entry was hidden rather than errored, so the loss was silent: a carried
  armour's **Toggle Worn**, a held weapon's **Attack / Block / Counterstrike**, and a
  combat technique's **Improve with SDR** all vanished from the row menu, leaving
  only the four entries whose triggers reference nothing. The item sheet's Actions
  tab and programmatic `executeAction` were unaffected (they resolve through the
  parent chain, not the DOM), and the carried gate itself was always honest.

    Both sheet bases now stamp `data-actor-id` on the sheet root in `_onRender` (an
    owned item sheet carries its owner's), and `resolveContextItem` /
    `resolveContextActor` additionally fall back to the row's own `data-uuid` — which
    also lets an unowned world/directory item row bind for the first time.

- **Attribute sheet: Score and Init Dice Formula rendered with empty labels
  (#1105).** `formGroup` labels a field from `field.label`, which Foundry assigns
  only when a `<PREFIX>.FIELDS.<path>.label` key exists — and there were no
  `SOHL.Attribute.FIELDS.*` entries at all, so the Properties tab showed two bare
  inputs. Added the four missing keys (new keys only).

- **Mysteries tab: the `Chgs/Max` and `Notes` headers collided (#1131).** The
  ledger grid has no column-gap, so a fixed column's gutter is its spare track
  width; the uppercased header's 63px glyph box left half a pixel inside its 4rem
  track and read as `CHGS/MAXNOTES`. Widened to 5rem for a legible gap — `Notes` is
  fractional and absorbs it, so the ledger's overall width is unchanged.

A new e2e spec asserts the **rendered** menu for a carried vs. uncarried gear item
and a held weapon, and `runtime-contracts.md` documents the sheet DOM markers a row
surface must emit — a synthetic `closest()` stub supplies the very marker a real
sheet was missing, so only a live-client assertion can catch this class of break.

Closes #1132
Closes #1105
Closes #1131
