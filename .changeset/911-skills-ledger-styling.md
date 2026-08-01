---
"sohl": patch
---

**Being sheet ledger styling polish (Manuscript)**

The Being sheet's shared `.ledger` table now reads consistently in the Manuscript
direction across every tab (Skills, Combat, Trauma, Mysteries, Gear, Profile).

- **Transparent icon wells** — the opaque bordered "stamp" box behind each row
  icon is gone, so item/skill icons sit as black-on-transparent line art directly
  on the vellum; the icon is a touch larger.
- **Larger, more compact rows** — head/row/cell/notes fonts are slightly larger
  with a tighter row rhythm.
- **Centered numeric headers** — a new `ledger__head-num` modifier centers a
  column header over its column. It is applied to every numeric column across the
  Being ledgers (Skills SB/ML/Index/EML/Fate, Combat strike-mode and body-location
  stats, Trauma Sev/HR/Bld and affliction Level/HR, Mysteries Level/ML/Charges,
  Gear Qty/Weight/Qual/Dur, Profile affiliation Level), so headers line up over
  their centered values. Name and Notes columns stay left-justified and clip with
  an ellipsis on overflow.
- **Centered enum text** — a new `ledger__cell--text-center` modifier centers a
  short prose/enum value in its column while keeping the body (non-mono) font.
  Applied to an Injury's Aspect and to Gear's Type; longer name/prose columns
  (Area, Skill, Source, Affiliation society/office/title) remain left-justified.
- **Affliction Level is numeric** — after the Trauma migration an affliction's
  Level is always a plain number, so it now uses the centered numeric cell instead
  of the left-aligned text cell.
- **Faint search placeholder** — the search inputs' placeholder text (e.g.
  "Search Skills") renders as a light prompt rather than near-black input text.

All of the above live on the shared ledger component and its templates, so the
tabs stay visually consistent.

Closes #911
