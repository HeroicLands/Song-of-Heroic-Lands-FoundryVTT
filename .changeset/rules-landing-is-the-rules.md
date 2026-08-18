---
"sohl": patch
---

Make `/rules/` the rules, the way `/user-guide/` is the user guide
([#1318](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1318)).

The **Rules** card on [the knowledgebase](https://www.heroiclands.org/sohl/kb/) landed on
`/rules/` — an automatically generated section listing. A reader who clicked it
arrived at a flat index of every page filed under the section, with nothing to say
which of them the rules begin at. The reading order added in #1316 was one click
away and unreachable from the front door.

The two cards beside it did not have this problem, and the reason is worth stating,
because it is the whole fix: the content build routes a note to its section landing
when — and only when — its source file is named `README.md`. `kb/dev-docs/README.md`
and `assets/content/User_Guide/README.md` both take that branch, so for those
sections the landing _is_ the authored introduction. The rules named their opener
`_Introduction.md`, like every chapter opener beneath it, so the section had no
landing source and its introduction published as an ordinary page one level down.

`assets/content/Rules/_Introduction.md` is now `assets/content/Rules/README.md`.
`/rules/` is the introduction — what the rules cover, the numbered reading order for
all ten chapters, and the pointer to the glossary — and all three home-page cards
now point at their own section root. Chapter openers below it are ordinary pages and
keep the `_Introduction.md` name.

Two things fall out of the rename. The `README_META` entry for `rules`, written for
a landing that never existed, is live at last, so the page carries the same title and
hero banner as the card that leads to it. And the introduction's old address,
`/rules/song-of-heroic-lands-rules/`, redirects to `/rules/` — recorded in
`kb/data/legacy-slugs.json`, the append-only history of every content URL that has
moved.

Nothing about the Foundry compendium changes: a journal entry takes its name and id
from frontmatter, not from its filename, so the rules entry compiles identically.
