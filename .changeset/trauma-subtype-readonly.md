---
"sohl": patch
---

**Trauma sheet: sub-type is read-only after creation.** The Trauma item sheet
no longer renders an editable **Trauma Type** dropdown on its Properties tab. A
document's sub-type is fixed at creation, and the sub-type is already shown
read-only in the sheet header (via the localized type label), so the editable
control was both redundant and incorrect. (Closes #926; supersedes #754, which
localized the now-removed dropdown's choice labels.)
