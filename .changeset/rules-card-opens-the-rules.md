---
"sohl": patch
---

Land the knowledgebase's Rules card on the rules, not on a list of them
([#1318](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1318)).

The **Rules** card on [kb.heroiclands.org](https://kb.heroiclands.org/) — both its
heading and its _Read the rules →_ button — pointed at `/rules/`, the
automatically generated section listing. A reader who clicked it arrived at a flat
index of every page filed under the section, with nothing to say which of them the
rules begin at. The reading order added in #1316 was one click away and unreachable
from the front door.

Both links now open the rules introduction at
`/rules/song-of-heroic-lands-rules/` — the front page of the book, which states
what the rules cover and carries the numbered reading order for all ten chapters
and the glossary.

**Why this card differs from its two siblings.** _Developer Documentation_ and
_User Guide_ link to their section landings (`/dev-docs/`, `/user-guide/`) and are
right to: each of those sections is authored from a `README.md`, which the content
build routes to the landing itself, so the landing _is_ the introduction. The rules
tree instead names every chapter opener `_Introduction.md`, so it has no README,
its landing is unauthored, and its introduction is an ordinary page with its own
URL. The card is pointed at that page, and a comment on it records why — so the
next reader does not "fix" it back to `/rules/` for symmetry.
