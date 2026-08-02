---
"sohl": patch
---

**Themed default icons for freshly-created items**

An item created without an explicit image — most visibly a Trauma or Affliction
added from the Being sheet (e.g. **Add Trauma**) — no longer falls back to
Foundry's white `icons/svg/item-bag.svg`, which was invisible on the light
Manuscript sheet and did not adapt to theme. `SohlItem.getDefaultArtwork` now
gives every known item type the same themed `systems/sohl/assets/icons/**`
default the compendium builder already applies to pack content (Trauma → wound
icon, Affliction → sick icon, and so on), so the icon renders dark ink in light
mode and cream in dark. Unknown or `base`-typed items still fall back to
Foundry's default.

The per-type default map is now a single framework-free source of truth
(`src/utils/default-item-art.mjs`), shared by both the runtime and the pack
builder so the build-time and runtime defaults can no longer drift apart — which
is what left runtime creation on the white bag in the first place.

Closes #932
