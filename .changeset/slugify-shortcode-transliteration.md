---
"sohl": patch
---

**Fixed: a suggested `shortcode` could lose the first letter of a name.**
`slugifyShortcode` deleted every non-ASCII character instead of transliterating
it, so the create dialog offered `thelred` for _Æthelred_, `ornhall` for _Þorn
Hall_ and `strae` for _Straße_. Accented letters fared no better — _Kûrbúl Helm_
became `krblhelm`. Names are now carried into ASCII by spelling each letter out
(`æ`→`ae`, `þ`→`th`, `œ`→`oe`, `ß`→`ss`, and every accented letter to its base).

**Suggested shortcodes are now shorter and more conventional.** A name's words
are replaced with their customary abbreviations — ranks, offices, materials and
units, matched as whole words — and if the result still runs past ten
characters, vowels are removed one at a time from the end until it fits. A
word's opening vowels are never removed, so _Aeldred_ reduces to `aeldrd` and
never to `ldrd`.

Removing one vowel per pass, rather than all of them at once, is what keeps a
name only slightly too long from being stripped bare: _Round Shield_ is eleven
characters and becomes `roundshild`, not `rndshld`. Ten characters is a
guideline rather than a limit: nothing is truncated, and the suggestion remains
a default the author may replace.

This affects only the value offered when a document is created. Existing
shortcodes are saved world data and are untouched.
