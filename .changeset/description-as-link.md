---
"sohl": patch
---

An item description that is only a link now points at what it links to.

Write a description consisting of nothing but a `@UUID` link and the item is saying
"my description lives there". **Display Description** follows the pointer and shows the
target — a journal page, or another item's description — instead of showing the reader a
link they would have to click.

**Markup does not count.** A link wrapped in a paragraph, a heading, bold text, or trailed
by empty paragraphs and line breaks is still just a link. What matters is whether anything
a reader would actually see remains once the markup is stripped.

**Anything else is ordinary prose.** A description that opens with a link and continues
with a sentence is left exactly as written, because a GM's own words are never discarded
in favour of a target's. Someone who wants the target's text inline embeds it deliberately.

Nothing is taken away: the description remains a free HTML field, the Description tab
works as it always has, and the convention applies only when an author chooses to write a
link and nothing else. A pointer whose target will not resolve falls back to the link,
which renders as a broken content link — visibly wrong rather than silently blank.

This is what lets an item stop carrying its own copy of prose that belongs to the
compendium. See #1348 for the scale of that: 7.59 MB of description across the actors
pack, containing 74 distinct texts.

Part of #1348.
