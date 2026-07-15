---
"sohl": patch
---

**Actor sheet search filter works for effects and body-location rows**

The filter previously called `querySelectorAll(".item")` and read `el.dataset.itemName`. Effect rows use `.effects__row` (no `.item`) and body-location rows are `.item` but carry no `data-item-name` — so both were silently broken (effects never matched; body-locations were all hidden on any query).

**Approach:** A new `applySearchFilter(query, rgx, content)` pure helper queries `[data-search-name]` and reads `el.dataset.searchName`. `SohlActor._displayFilteredResults` now delegates to it. All filterable `<li>` rows in the eight being/cohort tab templates receive `data-search-name="{{name}}"`, making the filter class-agnostic and fixing effects, body-locations, and gear in one pass.

Closes #104.
