---
"sohl": patch
---

**Being sheet** — the **Trauma** tab is now called **Health** (#1122).

The tab holds two sections, _Injuries_ (Trauma items) and _Afflictions_
(Affliction items), so naming it after one of the two item types made it look
like it promised only traumas — and set up a mismatch, since the Trauma item
uses a different icon (`fa-user-injured`) than the tab (`fa-heart-pulse`).

The icon was already right. The sheet follows a consistent rule: a tab holding
one item type takes that type's icon (Skills, Combat, Mysteries), and a tab
holding several takes a neutral one (Gear). A tab spanning traumas and
afflictions correctly takes a neutral health icon; only the name was wrong.

Label only — the tab id stays `trauma`, so bookmarks, templates, and specs are
unaffected, and the existing localization key takes a new value rather than
being renamed.
