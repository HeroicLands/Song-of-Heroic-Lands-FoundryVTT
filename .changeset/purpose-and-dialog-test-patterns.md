---
"sohl": minor
---

**Document what SoHL is for, and the consent-dialog testing pattern**

Now that the consent model reaches all the way to the timed-effect flows (issue
#579), write down the two things that make it legible — one for players, one for
contributors — and make the e2e suite model the pattern it now describes.

- **User guide — "What to Expect: SoHL Assists, It Doesn't Play for You."** A short
  up-front section on the system's purpose (an _assistant_ for playing HârnMaster,
  not a video game that plays it for you) and the one rule everything follows: _it
  guides, prompts, and reminds — it never acts on your character without your
  say-so._ It explains the two shapes an offer takes (a **dialog** when the choice
  is yours here and now; a **chat-card button** when the response is deferred or
  belongs to someone else), that you can always ignore / do-by-hand / GM-override,
  and the pattern to expect throughout — _offer → remind → perform → offer the
  next_ — with a worked wound example. Patterns, not a per-flow catalog, so the
  guide stays lean.

- **Testing doc — "Consent dialogs are landmines."** A new subsection on the e2e
  reality that a consent dialog hangs a headless run until something answers it.
  Two sanctioned ways: **press the real button** (`cy.submitDialog("<action>")`
  against a stable `data-action`) to model the user when the offer _is_ the subject
  under test; or **pre-answer / suppress** it (`{ skipDialog: true }`,
  `scope: { schedule: false }`, or inline `data-scope`) for setup. The rule of
  thumb: when you add an offer behind a human trigger, grep `cypress/e2e` for the
  specs that hit that seam and make each one answer it (and note that
  `createEmbeddedDocuments` bypasses the offer entirely).

- **A button-driven e2e that follows the pattern.** `timed-effect-reschedule.cy.js`
  gains a companion test that presses the actual **Not Now** button on the reschedule
  offer and asserts the schedule clears — proving the button choice, not a scripted
  scope, drives the outcome, exactly as the doc recommends.

Refs #579.
