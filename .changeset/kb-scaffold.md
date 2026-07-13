---
"sohl": patch
---

**Knowledgebase scaffold — Astro + Starlight rendering `docs/` and `assets/content/` (#422)**

Adds a self-contained `kb/` Astro sub-project (Starlight) for the knowledgebase
site, isolated from the system's root dependencies. It renders two in-repo
Markdown roots, sectioned by audience:

- **Developer** — the repo's `docs/` tree, via a custom loader that derives each
  page's title from its `# H1` (most `docs/` pages carry no `title:` frontmatter).
- **Reference** — the authoritative `assets/content/` tree, loaded whole and routed
  by frontmatter `type`, not directory. A proof-of-pattern `type: weapongear`
  reference page reproduces the Fléchette layout: body prose plus a "Weapon
  Profile" infobox (Price/Weight/Durability/Heft) generated from — and validated
  against — a Zod schema mirroring the WeaponGear DataModel, so a malformed weapon
  fails the build.

Build with `npm run build:kb`. This is the first phase of the knowledgebase under
#418; full per-type infobox coverage, the api/kb prose split, and CI/deploy wiring
are follow-up sub-issues.
