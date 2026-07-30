---
"sohl": minor
---

**General welcome card on first launch**

New players now get a proper front door. On the first load of a world, each user
receives a single, non-blocking **welcome chat card** that:

- prominently links to the project site (**heroiclands.org**),
- points at the bundled **User Guide** journals (in the _Journals_ compendium), and
- **highly recommends the guided tours**, with a one-click **Start** button for the
  flagship Character Creation tour plus instructions to reach every tour from
  _Settings → Tour Management_.

The card is whispered once per user (recorded by a `welcomeCardShown` flag) and only
_offers_ the tour — it never auto-starts it. It replaces the old, never-rendered
welcome **dialog**, whose `showWelcomeDialog` setting has been removed, and absorbs
the former Character Creation tour-offer card so the welcome is no longer coupled to
the tour.

Closes #830
