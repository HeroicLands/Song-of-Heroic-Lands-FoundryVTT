---
"sohl": patch
---

**KB reference pages for every compendium type (#425)**

Generalizes the knowledgebase Reference section from the weapongear exemplar
(#422) to all item types. A per-type registry (`kb/src/reference/registry.ts`)
gives each type a category, a Zod schema that validates its `sohl` block (a
malformed entry fails the build), and an infobox row set with per-field
formatting. Generic routes (`/reference/[category]/`) render each type's category
index and entry pages, routed by frontmatter `type`; the sidebar "Compendium"
group lists every category.

Covers weapongear, armorgear, miscgear, containergear, projectilegear, skill,
trait, attribute, affliction, mysticalability, and corpus (~1,100 reference
pages; the build now emits ~1,200 pages total). Actor reference pages remain a
follow-up.
