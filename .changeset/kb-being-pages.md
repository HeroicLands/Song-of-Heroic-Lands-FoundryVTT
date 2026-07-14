---
"sohl": patch
---

**KB: being (character / creature) reference pages (#429)**

Beings now have a full reference presence in the knowledgebase, matching the
shared theme's character/creature profile sidebar. A being note carries its
embedded documents as raw `sohl.items[]` (`{ shortcode, type, system? }`); the
content-prep step (`utils/build-kb-content.mjs`) derives the flattened, resolved
shapes the sidebar reads, resolving each item's `shortcode` against a
content-wide `"<type>:<shortcode>" → { name, url }` index for display names and KB
links:

- `sohl.skills` — `{ shortcode: masteryLevelBase }` from the note's `skill` items.
- `sohl.gear` — grouped `{ weapons, armor, projectiles, misc, containers,
concoctions }`, each an array of `{ name, shortcode?, url? }`, from the gear items.
- `sohl.corpus` — `{ name, shortcode?, url? }` from the `corpus` item.
- `sohl.spells` / `sohl.talents` — from `mysticalability` items by `subType`.

Attributes already matched the sidebar shape and pass through untouched. Only
fields the author didn't supply are derived (hand-authored values win); an inline
`name` beats the index, and an unresolved shortcode falls back to itself rather
than dropping the entry. Beings route by frontmatter `type` to `/beings/`,
consistent with the item reference pages, so Basic Folk now renders with its
portrait, profile, attribute grid, categorized skills, and equipment.
