---
"sohl": patch
---

**Birthsigns now encode the Astrokýklos element matrix** ([#1233](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1233))

Each of the twelve birthsigns carries one Active Effect per **element**, where an element is a set of skill subtypes together with that element's own skill shortcodes:

| Element | `subType`                   | `shortcode`           |
| ------- | --------------------------- | --------------------- |
| earth   | `nature`                    | `earth`, `physera`    |
| metal   | `script`, `craft`           | `metal`, `sideros`    |
| fire    | `combattechnique`, `combat` | `fire`, `pyrethos`    |
| air     | `physical`                  | `air`, `zepharis`     |
| spirit  | `mystical`, `lore`          | `spirit`, `pneumenos` |
| water   | `language`, `social`        | `water`, `hydalis`    |

Previously only Arnos was on this shape, and three of its six `test` expressions had an unterminated string literal — so those effects threw at construction and silently never applied. The other eleven signs emitted one effect per _subtype_ with no shortcode arm and modifier values unrelated to the matrix.

All twelve signs now match their matrix row, and `tests/content/birthsign-effects.test.ts` asserts the content directly: every `test` parses under the `effect.itemTest` scope, and each effect targets exactly its element's subtypes and shortcodes at the modifier the matrix specifies.
