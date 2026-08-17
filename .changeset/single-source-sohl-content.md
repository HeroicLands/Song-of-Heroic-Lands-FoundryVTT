---
"sohl": patch
---

**`assets/content/` is this repository's own source** (#1445)

The tree was a generated, committed mirror of the HeroicLands vault: an edit made
here was reverted by the next export without a word, and the vault was the only
place content could be fixed. With the vault being retired (#1385), that
relationship inverts — the tree is source, and this repository owns it.

- _A final export, then the mirror is gone._ The committed tree had drifted badly:
  91 notes created, 1351 updated, 91 retired, 4 unchanged. The 91/91 pair is a
  single directory rename in the vault — `Creatures/` → `Bestiary/`, every
  basename matching — so nothing was lost, but the repository had been serving a
  stale copy.
- _The collection landings arrive._ Eleven `type: doc, category: collection` notes
  lived only in the vault's `Types/SoHL/` and were never exported, because the
  export mirrors `SoHL/` alone. They are the only place a section's description
  and its `doc-<section>` address exist, so they come across rather than being
  lost with the vault.
- _The export is deleted, not maintained._ `utils/export-vault-content.mjs`,
  `utils/vault-export.mjs`, and the `content:export` / `content:check` scripts are
  removed, along with every error hint telling a contributor to re-export.
