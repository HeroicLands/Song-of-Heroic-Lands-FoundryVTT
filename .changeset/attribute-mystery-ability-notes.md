---
"sohl": patch
---

Describe attributes, birthsigns and mystical abilities well enough to read
([#1294](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1294)).

The skill notes were rewritten separately; this finishes the other three kinds
of content note the rules link into. A reader following a link out of the rules
into a birthsign or a mystical ability previously arrived at two sentences of
flavour and no mechanism at all — and the generated attribute table rendered an
empty column for all sixteen rows.

**Attributes.** All sixteen now carry a one-line `description`, so the attribute
table in the Attributes introduction renders what each attribute measures
instead of sixteen em dashes. The note bodies, which were already substantial,
are untouched.

**Mystical Abilities.** All nine notes now say what the ability covers, how it
is invoked, and what bears on the test — mean 55 words to 314, with the two
empty notes (_Fate_ and _Spirit_) written from nothing. Each names where its
Effective Mastery Level comes from, since that is the one thing the three
governing forms differ on: _Alchemy_ from the ability or its governing skill,
_Talent_ from itself, and _Spirit_, _Summoning_ and _Trance_ from the Spirit
Power they are performed through. The four divinatory notes state what a
success level actually buys — the quality of the reading, with a Critical
Failure delivering a false answer the diviner believes. The standing limits
(nothing under Aural Shock, no Mystical Ability test may be fated) are stated on
every one.

**Birthsigns.** All twenty-four now state their own numbers. The modifiers a
sign confers lived only in its Active Effects, which a reader never sees, so
each note carries a six-row table of what the sign does to every element of the
Astrokýklos, and a sentence naming what its natives come readiest and hardest
to. The `description` on each — previously one of two boilerplate sentences
repeated twelve times each — now names the sign's emblem and its extremes, which
is what the new wheel table on the Birthsign page renders.

**The Birthsign rules page** gains the element scheme the signs are built on:
which skills each of the six elements claims, the range and step of the
modifiers, the twelve principal signs and their emblems, how a cusp relates to
its neighbours, and a generated table of all twenty-four.

**A test keeps the tables honest.** `tests/content/birthsign-effects.test.ts`
already held the sign matrix as an executable specification; it now also parses
each note's authored table and fails if a stated modifier drifts from the
Active Effect that applies it.
