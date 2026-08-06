---
"sohl": patch
---

**Docs: the Skill Intrinsic Actions in the User Guide, with Combat Technique folded in**

The Skill page described a handful of properties and none of the eight actions a
Skill defines — including the three combat actions a combat technique carries.
Combat techniques also still had a page of their own, describing them as a separate
item type they have not been since they became a Skill category.

`User_Guide/Items/Item_CombatTechnique.md` is **deleted** and its content folded into
`Item_Skill.md`, which keeps `Combat Technique` / `Combat Techniques` as aliases so
existing links still resolve; the one inbound wikilink (from **Weapon Gear**) is
repointed.

- **The six visible actions** — **Success Test** (`successTest`), **Success Value
  Test** (`successValueTest`), **Toggle Improve Flag** (`toggleImproveFlag`),
  **Improve with SDR** (`improveWithSDR`), **Opposed Test** (`opposedTestStart`), and
  the combat-technique **Attack** / **Block** / **Counterstrike** (`attackTest` /
  `blockTest` / `counterstrikeTest`) — each with its shortcode, icon, API link, how
  it is invoked, what it changes, and where it refuses. The standard test dialog and
  the strike-mode picker are named and linked to **Base Item** rather than
  re-described, and the opposed-test flow is linked to **Token**.
- **The test-result card** is documented part by part, including the Success Value
  Test's extra **Success Value** and **Success Stars** rows and the four grades
  (No Value / Little Value / Base Value / Bonus Value) its result names.
- **The two hidden actions** — `setImproveFlag` and `unsetImproveFlag` — are
  documented and flagged as never appearing in the Actions context menu, having been
  superseded by the toggle.
- **Combat Techniques** get their own section: what they are, why creatures rely on
  them, the **Strike Modes** tab, and a field-by-field table of the strike-mode
  editor (the melee/missile split, attack, impact, and defense).
- **Sheet shortcuts** are described alongside the actions — the EML, Fate, and
  Atk/Blk/CX cells, the ☆ improvement star, and the Shift-click that skips the
  pre-roll dialog.
- **Additional Properties** is corrected against the schema: the Category list
  (adding _Mystical_ and _Combat Technique_, dropping a category that does not
  exist), the fields' real sheet labels, and the previously undocumented **Adopt
  Parent Mastery** and **Impaired By Roles**.

Two defects found while writing the page are noted in place and filed: **Improve with
SDR** is offered only while the skill is _not_ flagged for improvement, the reverse of
the intended workflow (#1102), and its chat card renders a blank **Target** and
**Roll** (#1103).

Closes #1063
