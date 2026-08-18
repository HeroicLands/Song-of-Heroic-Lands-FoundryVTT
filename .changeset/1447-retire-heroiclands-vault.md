---
"sohl": patch
---

Retire the HeroicLands vault as a content source (#1447).

The vault was the migration's source, not an ongoing one. With `sohl` (#1445),
`thalorna` (#1441) and the site (#1448) each owning their content, nothing reads
it any more — but several places still told a reader otherwise.

- _The dead export config is gone._ `.env.local.example` still documented
  `HEROICLANDS_VAULT`, `npm run content:check` and `npm run content:export` as the
  way to regenerate `assets/content/`. None of those exist; the block is removed.
- _`assets/content/` is described as source._ `content-tables.md` said content is
  authored "in the HeroicLands Obsidian vault". It is authored in
  `assets/content/`, which is opened as a vault so Dataview still renders the
  tables live while writing.
- _The cross-repository map matches the repositories that exist._ Issue Reporting
  §9 and the Definition of Done listed a three-repository project with the vault as
  one of them; they now name `sohl-thalorna` alongside the system and the site.
- _The `vault` label is retired, not deleted._ `sync-labels.mjs` deletes any label
  absent from `.github/labels.yml`, which would strip the label from every issue
  that carries it. It stays, redescribed as retired, so historical issues keep
  their delivery target.

A note count reconciles the vault against the package repositories: all 1,442
`SoHL/` notes and 11 `Types/SoHL/` collections are in this repository, and all
1,725 `Setting/` notes and 15 `Types/Thalorna/` collections are in `sohl-thalorna`.
Nothing was lost in transit.
