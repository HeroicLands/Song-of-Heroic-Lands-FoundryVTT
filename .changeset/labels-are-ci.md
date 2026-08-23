---
"sohl": patch
---

**Label syncing is an Action, not a script this repository carries.**
`utils/sync-labels.mjs` is gone; `labels-sync.yml` calls
`HeroicLands/.github/actions/labels` instead.

Every HeroicLands repository carried its own copy of that script — 95%
identical, and drifted in all three. Labels are neither a content tree nor a
Foundry package, so neither build toolchain was the right home; what the code is
is CI, so that is where it lives now.

`utils/check-labels.mjs` keeps only the half no other repository could run:
that `.github/labels.yml` and §3 of `issue-reporting.md` agree. Validating the
registry itself — names, colours, duplicates, GitHub's 100-character
description limit — moved into the action with the sync.

The workflow now also runs on a pull request touching the registry, reporting
what a sync _would_ change without writing. The set is closed, so a label
dropped from the file is deleted from every issue carrying it; that is worth
seeing in review.
