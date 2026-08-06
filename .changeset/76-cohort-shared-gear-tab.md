---
"sohl": minor
---

**Cohort Shared Gear tab: see what the group has to hand**

A Cohort now has a **Shared Gear** tab listing the gear its members carry and have
marked as shared with the group — the party's rope, lantern, and rations gathered
into one view, whoever's pack they are actually in.

- **It is a view, not a store.** Each item stays on the member carrying it: nothing
  is copied onto the cohort, the weight still counts against its carrier's
  encumbrance, and only the carrier can use it. The tab is read-only — no drag and
  drop, no container reassignment, no carried/worn toggles, and no create or delete
  controls. Edit an item where it lives.
- **The columns are the ordinary Gear tab's, plus _Carried By_** naming the
  custodian. **No combined weight is reported**: a sum across separate carriers is
  nobody's load.
- **Sharing is set on the item**, on the character carrying it — a new **Shared
  With** control on every gear type's Properties tab, which appears only when the
  world has a Cohort. Because the setting lives on the item, its owner always
  decides what the group sees; a cohort can never claim gear.
- **Sharing is keyed by the cohort's shortcode** — the stable key an author writes,
  matching how a cohort's Members list references its actors. Lists already holding
  a cohort's document id or UUID keep resolving, so no data changes and no migration
  is needed.

Documentation updated: the Cohort and Gear user-guide pages and the common-tabs
reference describe the tab, what it deliberately does not do, and how to share an
item.

Closes #76
