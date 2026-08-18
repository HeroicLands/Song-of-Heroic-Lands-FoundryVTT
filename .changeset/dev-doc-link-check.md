---
"sohl": patch
---

Check the developer docs' links, and repoint the twenty-five that were broken
([#1364](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1364)).

`kb/dev-docs/` links by relative path — the tree is read in the repository and on
GitHub as much as on the knowledgebase, and a path is what those renderers
follow. Nothing validated those paths: `check-content-links` scans
`assets/content` only, so the whole developer tree was unchecked.

It had rotted accordingly. The `docs/` → `kb/dev-docs/` move left every
repo-root-relative link one directory too high, and nobody noticed because the
symptom was invisible in both places it mattered: on the knowledgebase the link
became `…/blob/main/kb/src/…`, a GitHub 404, and in the repository it simply
pointed at nothing. Twenty-two links were off by that one level. Two more named
`templates/effects/`, a directory that is `templates/effect/`, and one pointed at
`assets/content/Corpora/Human_Folk.md`, a note removed when the Corpus concept
was retired — now the Basic Folk character that carries the body structure
today.

`npm run lint:doc-links` (in `npm run lint`) now fails on a relative link whose
target does not exist, and on an `#anchor` no heading in the target declares. It
matches GitHub's slug rules, including the details that trip a naive
implementation: runs of whitespace are not collapsed, so dropping an `&` leaves
`player--gm-rules-external` with two hyphens, and a code span inside a heading is
part of the text the anchor derives from.

Wikilinks remain unavailable in the developer tree, deliberately: they resolve by
`(type, shortcode)` from a note's frontmatter, which these pages do not have, and
they would not render in the repository or on GitHub. The reference page on
[linking between content notes](https://www.heroiclands.org/sohl/kb/dev-docs/reference/content-links/)
now says so explicitly, and names this check as what keeps a path honest.
