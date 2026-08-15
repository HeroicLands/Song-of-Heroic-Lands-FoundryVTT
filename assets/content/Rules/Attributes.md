---
aliases:
    - Attributes
    - doc-attributes
id: dg1YJe27cn88Q2mi
type: doc
package: sohl
category: rules
name:
    full: Attributes
    aliases: []
folder: RqKUTBUBN2Y3MHYB
shortcode: attributes
---

An **attribute** is an innate capacity a character is born with and develops
only slowly — the raw material a skill is built on. Where a skill measures
training at a particular activity, an attribute measures the underlying faculty
that training draws upon.

Attributes matter chiefly through [[doc-mstrylvl#skill-base|Skill Base]]: a
skill's starting [[doc-mstrylvl#mastery-level|Mastery Level]] is derived from
the attributes that skill depends on, so a character's
innate capacities shape what they can readily learn. They are also tested
directly when a situation calls on raw capacity rather than trained technique.

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Name",
  shortcode AS "Shortcode",
  description AS "Description"
WHERE type = "attribute"
SORT name.full ASC
```
