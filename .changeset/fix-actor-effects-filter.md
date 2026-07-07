---
"sohl": patch
---

**Fix #104:** Actor sheet search filters now work for effects, gear, and
body-location rows.

`SohlActor._displayFilteredResults` was querying `.item` elements and
reading `el.dataset.itemName`, but effect rows are `.effects__row` and
carry `data-effect-name`, while body-location rows carry no name attribute
at all — so those filters were silent no-ops.

**Fix:** switch `_displayFilteredResults` to query `[data-search-name]`
and read `el.dataset.searchName`, then stamp `data-search-name` on every
filterable row across all eight search lists:

- `templates/actor/being/profile.hbs` — traits
- `templates/actor/being/skills.hbs` — skills
- `templates/actor/being/mysteries.hbs` — mysteries and mystical abilities
- `templates/actor/being/trauma.hbs` — injuries and afflictions
- `templates/actor/being/combat.hbs` — body-location rows (`loc.shortcode`)
- `templates/actor/parts/gear.hbs` — gear items (`item.name`)
- `templates/actor/parts/effects.hbs` — own and transferred effects

The existing `data-item-name` and `data-effect-name` attributes are
preserved for other consumers.
