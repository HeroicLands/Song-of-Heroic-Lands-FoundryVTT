---
"sohl": patch
---

**Docs: a Trauma page in the User Guide, documenting its Intrinsic Actions**

Trauma is the item that records every kind of harm a character carries — wounds,
bleeding, infection, shock, coma, fatigue, fear, morale, psyche stress, aural shock,
and the Pall — and it had no User-Guide page. The Injury page covered one sub-type in
thirty lines and described none of the eleven actions a Trauma defines. It is now
`User_Guide/Items/Item_Trauma.md`, with the Injury content folded in and the old page
repointed (its journal id is preserved, and `Injury` remains an alias, so existing
links still resolve).

- **What a Trauma is** — the eleven Trauma Types and what each is measured by, and
  the distinction from an Affliction: a Trauma is harm the character _carries_, an
  Affliction is an outside _agent_ working on them.
- **Additional Properties** — a field-by-field table of the Properties tab, noting
  which Trauma Types show which fields, and calling out the two derived states that
  are not checkboxes: a wound is _treated_ when it has a treatment date, and it
  _bleeds_ while its Blood-Loss Interval is set.
- **The four visible actions** — **Request Treatment** (`requestTreatment`), **Treat
  Injury** (`treatInjury`), **Treatment Test** (`treatmenttest`), and **Request Blood
  Stoppage** (`requestBloodStoppage`) — each with its shortcode, icon, API link, how
  it is invoked, what it changes, and when it refuses. The Treat Injury dialog's
  **Healing Rate** field is described, and both request cards are documented button
  by button, including why their buttons are open to any Physician-skilled character
  rather than addressed to one.
- **The seven hidden actions** — `acceptBloodStoppage`, `healingCheck`,
  `bloodLossAdvanceCheck`, `courseCheck`, `psycheRecovery`, `auralShockRecovery`, and
  `pallRecovery` — documented and flagged as never appearing in the Actions context
  menu, each placed at the card button or scheduled reminder that actually triggers
  it. Their result tables (blood loss per success level, course-test Healing Rate
  movement, the three recovery outcomes) are given in player terms, along with the
  three things that stop a wound healing and the Face the Pall card's deliberate
  lack of buttons.
- **Two orienting sections** — how a wound travels from infliction through treatment
  to closure, and the _offer → remind → perform → offer the next_ loop every
  recurring check follows, including catch-up when game time jumps.

`healingtest` is an unimplemented stub and is omitted. Three defects found while
writing the page are noted in place and filed: the injury actions are missing from
the context menu (#1085), the recovery-check schedule offers show a raw localization
key (#1086), and the Treat Injury dialog wrongly promises that Healing Rate 0 heals
the wound (#1087).

**Afflictions and Injuries** gains a pointer to the new page and its stale
`item-injury` link is repointed.

Closes #1070
