---
"sohl": patch
---

**Skill sheet: surface Impaired By Roles**

The Skill item sheet now displays and edits `impairedByRoles`, at parity with the
Attribute sheet. The Properties tab renders an **Impaired By Roles** list with
Add/Delete controls bound to `system.impairedByRoles`; `SkillSheet` passes the
field into the render context. Previously the field existed in the schema and was
read by the impairment logic, but could only be set by editing raw data.

Closes #713
