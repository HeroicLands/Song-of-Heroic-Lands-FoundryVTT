---
"sohl": patch
---

**User Guide: new Token page documenting the opposed-test actions**

Adds `assets/content/User_Guide/Token.md`, the User-Guide page for the Token
document (#1073, part of the intrinsic-action documentation epic #1061). The
token's two intrinsic actions drive the opposed-test flow, and both are hidden
from the Actions context menu, so the page flags that and documents where each
one is really reached:

- **Opposed Test** (`opposedTestStart`) — started from a skill's or attribute's
  own _Opposed Test_ action, which hands the contest to the actor's token. Covers
  the prerequisites (a token on the scene, exactly one target, ownership of the
  target's token), the standard test dialog (linked to _Base Item_), and every
  part of the resulting **Opposed Action Request** card, including who may use
  its **Respond** button.
- **Resume Opposed Test** (`opposedTestResume`) — the responder's side, reached
  from that **Respond** button. Documents both fields of the _Respond to Opposed
  Test_ dialog (the skill/attribute picker with its mastery levels, and the
  additional modifier) and reads the **Opposed Action Result** card section by
  section: the per-side modifier breakdowns, the results grid, the outcome line,
  and the success stars.

Each entry lists the action's name, shortcode, icon, how it is invoked, and a
link to its API documentation, and the page cross-links the _Opposed Tests_
rules, _Skill Tests_, _Combat Basics_, and _Scene Setup_.
