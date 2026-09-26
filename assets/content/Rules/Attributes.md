---
shortcode: attributes
name: {full: Attributes, aliases: []}
type: doc
subType: rules
data: {packFolder: rules}
---

An **attribute** is an innate capacity a character is born with and develops only slowly — the raw material a skill is built on. Where a skill measures training at a particular activity, an attribute measures the underlying faculty that training draws upon.

Attributes matter chiefly through [[doc-mstrylvl#skill-base|Skill Base]]: a skill's starting [[doc-mstrylvl#mastery-level|Mastery Level]] is derived from the attributes that skill depends on, so a character's innate capacities shape what they can readily learn. They are also tested directly when a situation calls on raw capacity rather than trained technique.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Name",
       shortcode    AS "Shortcode",
       description  AS "Description"
FROM notes
WHERE type = 'attribute'
```
