---
"sohl": patch
---

**Docs: the Affliction Intrinsic Actions in the User Guide**

The Affliction page listed a handful of properties and ended in a TODO comment. It
documented none of the three actions that _are_ an affliction's entire lifecycle,
and nothing about how one actually progresses — so a reader had no way to learn
that an affliction added by hand never onsets, or what a Healing Check does to the
character when it goes badly.

- **All three implemented actions** — **Onset Check** (`onsetCheck`), **Healing
  Check** (`healingCheck`), and **Resolution Check** (`resolutionCheck`) — each
  with its shortcode, icon, API link, and an explicit flag that it is **hidden**:
  none is on the Actions context menu, and each is reached from the **Perform**
  button on its scheduled reminder. The offer-schedule dialog is named and linked
  to **Base Item** rather than re-described.
- **The lifecycle is described as a whole** — contracted → onset → the recurring
  course of Healing Checks → resolution — with the point made at each step that a
  human moves it along. Onset is called out as the one place two follow-up
  schedules are armed without asking, and why that follows from the **Perform**
  that was already pressed rather than excepting the consent model.
- **What each check does to the character** is given in player terms: the Course
  Test's ±1/±2 to the Healing Rate, the full reaction table (HR 6 defeats it, HR
  5/4 inflict 5/10 weakness fatigue, HR 3/2/1/below-1 impose Stunned /
  Incapacitated / Unconscious / Dead), that shock states only ever worsen, that the
  fatigue is recorded as its own Trauma, and that these rolls are **headless and
  post no result card**. The two conditions under which no Course Test is rolled at
  all — a blank Healing Rate, or no usable Endurance — are documented, since a
  lethal poison is _meant_ to sit at its rate and run out the clock.
- **Where It Appears** now describes the Health tab's affliction ledger column by
  column, and states plainly that only **Contract Disease** offers to start the
  clock — an affliction dragged in or added by hand sits inert.
- **Additional Properties** is corrected and completed against the schema:
  **SubType** is read-only in the sheet header subtitle (not on the Properties tab,
  as the page claimed), the three timing fieldsets and their formula/seconds/
  projection triples are documented, and the derived fields are separated from the
  stored ones. The page now says outright that an affliction's **Level does not
  move** — the **Healing Rate** is the number that does — because the Trauma page's
  behavior invites the opposite assumption.
- The stub actions are **not** documented, per the epic's scope, and the page's
  closing `TODO` comment is removed.

Two defects found while writing the page are noted in place and filed: the
Affliction context menu offers **nine unimplemented actions**, five of which throw
an uncaught error when clicked (#1126), and the **Outcome** field — Death or Cured,
the most consequential thing about an affliction — is **never rendered on the
sheet**, so anything authored in the UI silently carries the default of _Cured_
(#1128).

Closes #1069
