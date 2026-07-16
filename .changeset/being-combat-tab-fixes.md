---
"sohl": patch
---

**Being Combat tab: readable limb labels and a cleaned-up Body Locations list (#509)**

- Held-item limb labels show the readable part name ("Right Arm"), not the raw
  part code ("RARMPART").
- The Body Locations list drops the obsolete Probability column and the
  in-list "Held:" marker (held items are shown by the Held Items dropdowns), and
  its part sub-headers and rows pick up the compact list styling. Zones and hit
  probability are no longer modeled, so the prototype's zone hierarchy is not
  reintroduced; the filter bar is kept.
- The Corpus section renders as a single compact row.
