---
"sohl": patch
---

**The User Guide opens with a reading order, and nothing in it is orphaned** (#1320)

The User Guide root announced itself as "an index to the instructions on how to use this
system" and then linked two things: the Quickstart and the rules. There was no reading
order, no chapter structure, and no list of the forty pages the guide actually contains.
Everything below the root was reachable only by chance, through whatever cross-links two
pages happened to share — and six pages were reachable by no path at all.

- _A reading path._ The root now lays out ten chapters in the order a new group meets
  them, each with a sentence on what it covers: install and first roll, setting up a
  world, reading a sheet, the four kinds of actor, the item types, making tests, scenes
  and tokens, combat, harm, and the supernatural — with customization last, for GMs who
  want to go past what the sheets offer. A closing "where to look something up" answers
  the four questions people arrive with.
- _Scope, stated._ The guide describes the implementation — sheets, buttons, dialogs,
  chat cards, settings. The game itself is the rules, and **where the two ever differ,
  the rules are what the game is**. Read a rules page for what a procedure means; read
  the guide for where the button is.

**Two section introductions** now stand over the subdirectories that group related
pages. _Actors_ opens with a table for choosing between Being, Cohort, Structure and
Vehicle, then says what distinguishes each and what all four share. _Items_ groups the
fourteen item types by what they are for — what a character _is_, the supernatural, and
gear — and sends the reader to Base Item first, since that page already carries
everything the types have in common.

**Every page now leads somewhere.** _Actions_ and _Mystical Powers_ previously contained
no outbound links at all; a reader who landed on either had no way onward. Twenty-two
pages gained a **See also** section and fourteen more gained links back to their section
introduction and to the index. _Icon Legend_ had no `shortcode:`, so nothing in the
corpus could link to it even in principle — its generator now emits one, and a See also.

**The guard.** `npm run lint:content-links` walked the rules only, so a User-Guide orphan
was invisible to CI. The walk is now declared over a list of corpora and runs the same
check on both roots: all 72 rules documents and all 43 user-guide documents are
reachable, and a new page that nothing links to fails the build.

Closes #1320
