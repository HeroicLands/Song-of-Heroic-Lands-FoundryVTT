---
"sohl": patch
---

**An unlabelled `[[type-shortcode]]` link now reads as the target's name in both
content builds.** With no `|Text` label the pack compiler showed the raw address
— `[[doc-shock]]` rendered as "doc-shock" — while the knowledgebase showed
"Shock", so one authored link read two different ways.

Both builds now apply the same rule, and read it from the same place:

- A **qualified** target is an address, not prose, so an unlabelled link shows
  the target document's **name** — for `type-shortcode` and the legacy
  `type/shortcode` alike (the knowledgebase previously recognised only the
  slash).
- A **bare** `[[Text]]` is the prose the author wrote and still renders verbatim:
  _worsens the [[Shock State]]_ must not become "worsens the Shock".
- The knowledgebase build now reads "is this an address?" with the pack build's
  own qualifier rule, so a hyphen inside a note _name_ (`Grukar-ahk`) still
  resolves as an alias and the two builds cannot drift apart on it again.

(Closes #1409.)
