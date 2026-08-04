---
"sohl": minor
---

**Generalize the Skill Levels rules journal into a Skills overview**

The narrow **Skill Levels** rules journal (`Rules/Skill_Levels.md`) becomes a
broader **Skills** journal (`Rules/Skills.md`) that introduces how skills are
rated and tested, then links out to the detailed rules pages:

- **Success Tests** — d100 vs. Effective Mastery Level, the CF/MF/MS/CS success
  levels, and the extended **CS+1 / CS+2 / CF−1 / CF−2** notation.
- **Opposed Tests** — highest positive success level wins; victory degrees.
- **Success Value Tests** — Index + success-level modifier, and **Success Stars**.
- **Secondary Mastery** — Secondary Modifier and Secondary Roll.
- **Skill Levels** — the existing level/circle material, retained as its own
  section.

The Rules index's `## Skills` section now points at the generalized page. The
journal keeps its original `id` and gains `Skills`/`Skill` aliases (the old
`Skill Levels`/`Circle` aliases remain), so existing wikilinks still resolve.

Closes #994
