---
"sohl": patch
---

**Retire the always-visible empty Combat Technique section on the Skills tab**

The Being sheet's Skills tab is uniformly present-only: empty skill-subtype
sections are not rendered. The always-visible empty **Combat Technique** section
that #714 added (with its seeded per-subtype **+ Add** control) is formally
retired rather than special-cased back in. A being with no combat techniques
creates its first from the tab's global **Add Skill** footer, whose subtype
picker includes Combat Technique; once one exists, the Combat Technique section
renders like every other populated subtype, with its own **+ Add** control.

Closes #797
