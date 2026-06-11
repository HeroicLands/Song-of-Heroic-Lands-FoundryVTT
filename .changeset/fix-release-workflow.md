---
"sohl": patch
---

Fix the release automation so versioned changes actually publish.

The release workflow's build-and-publish job was gated on a `published` output
that `changeset version` never sets, so the GitHub Release and packaged
`system.zip` / `system.json` were never produced. The job now triggers once the
**Version Packages** PR merges — detected via `hasChangesets == false` plus an
untagged `package.json` version — and creates the `v<version>` tag and Release
with the manifest attached.

Also removes the redundant `changeset-pr.yml` workflow, which referenced a
nonexistent `npm run version` script; opening the Version Packages PR is now
handled solely by the consolidated release workflow (with the
`pull-requests: write` permission it needs).

Finally, the release prints a reminder (in the run summary) with the exact
`gh workflow run deploy-docs.yml --ref v<version>` command to publish the
versioned API docs — needed because a Release created with `GITHUB_TOKEN`
can't auto-trigger `deploy-docs.yml`. That manual dispatch now mirrors the
build to `/latest` (matching the automatic release behavior) when run against
a tag.
