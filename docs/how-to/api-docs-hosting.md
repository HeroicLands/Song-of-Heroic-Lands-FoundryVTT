# API Docs Hosting (api.heroiclands.org)

See also: [Getting Started](./getting-started.md), [Testing](./testing.md)

The TypeDoc API reference is published to **https://api.heroiclands.org** by the [`deploy-docs.yml`](../../.github/workflows/deploy-docs.yml) workflow. The site hosts **multiple versions side by side**, one per git ref (branch or tag), so you can read the docs for `main`, for any tagged release, or for a feature branch you're previewing — all at once, each under its own path.

## Site layout

Every published ref gets its own subdirectory. The path segment is the ref name (tags verbatim, branches slugified):

```
api.heroiclands.org/            → redirects to /latest/
api.heroiclands.org/latest/     ← mirror of the most recent published release
api.heroiclands.org/main/       ← docs built from the main branch
api.heroiclands.org/v0.7.0/     ← docs for release tag v0.7.0
api.heroiclands.org/v0.6.0/     ← older releases are kept
api.heroiclands.org/feat-foo/   ← optional: a feature branch you published
```

The naming rules:

- **Releases** publish under the tag name exactly as it appears on the GitHub Release (for example `v0.7.0`), and additionally overwrite **`/latest`** so the bare domain always lands on the newest release.
- **`main`** publishes under `/main`.
- **Feature branches** publish under their branch name with `/` slugified to `-`, so `feat/legacy-counterstrike-cleanup` becomes `/feat-legacy-counterstrike-cleanup/`.

The branch root also carries the `CNAME` (custom domain) and `.nojekyll` (so generated folders aren't filtered by Jekyll); the workflow rewrites both on every publish.

## How publishing works

The docs are served by GitHub Pages from the **`gh-pages` branch** (Pages source: *Deploy from a branch → `gh-pages` → `/ (root)`*). The workflow builds the HTML (`npm run docs:prepare && npm run docs:html`, output in `build/stage/docs`), then commits the result into the appropriate subdirectory of `gh-pages`, **replacing only that subdirectory** and leaving every other version untouched. That selective replacement is what lets versions accumulate.

The workflow runs on four events:

| Trigger | What it publishes |
|---|---|
| Push to `main` | `/main` |
| Release published | `/<tag>` and `/latest` |
| `workflow_dispatch` (manual) | `/<branch-slug>` for the branch you select |
| Branch deleted | removes that branch's `/<slug>` directory |

All runs share the `gh-pages-deploy` concurrency group, so they serialize and never race on the branch (a release, for example, triggers both a `/main` publish from the push and a `/<tag>` + `/latest` publish from the release event — these queue rather than collide).

## Adding a feature branch

Feature branches are **not** published automatically — you publish them on demand:

1. Make sure your branch contains the current `deploy-docs.yml` (merge `main` into it if needed). Manual dispatch runs the workflow file *from the selected branch*, and the **Run workflow** button only appears once the workflow exists on the default branch — so the workflow must already be on `main`.
2. In the repository, go to **Actions → Deploy API Docs to GitHub Pages → Run workflow**.
3. In the branch dropdown, select your feature branch and run it.
4. After the run completes, the docs are live at `api.heroiclands.org/<branch-slug>/` (with `/` replaced by `-`).

Re-running the workflow on the same branch rebuilds that subdirectory cleanly — stale files from a previous build are removed, not merged.

If you want a branch to publish automatically on every push (instead of manual dispatch), add it to the `push.branches` list in `deploy-docs.yml`. Prefer manual dispatch for one-off previews to keep the site uncluttered.

## Removing a feature branch

Deleting the branch is enough:

1. Delete the branch (locally then `git push origin --delete <branch>`, or via the GitHub UI).
2. The `delete` event triggers the workflow's cleanup job, which removes the matching `/<slug>` directory from `gh-pages`.

The cleanup job only acts on **branch** deletions, never tags — so released versions persist even if you later delete their tags. It also refuses to remove the reserved `main` and `latest` directories. To remove a published directory by hand, delete it from the `gh-pages` branch directly and push.

## Operational notes

- **Pages source must stay on the `gh-pages` branch.** The multi-version layout depends on branch-based publishing; do not switch the Pages source to "GitHub Actions" (the artifact method replaces the whole site on each deploy and cannot accumulate paths).
- **Keep the `gh-pages` branch.** It is the version store, not a throwaway. Its root `CNAME`/`.nojekyll` seed the custom domain and are preserved across publishes.
- **`/latest` appears after the first release.** Until then the root redirect target does not exist; browse `/main` directly.
- **Custom domain / DNS** for `api.heroiclands.org` is configured once (DNS record + Pages custom domain) and is unaffected by ordinary publishes.
