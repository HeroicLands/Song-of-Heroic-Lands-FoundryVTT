---
aliases: []
name:
    full: API Docs Hosting (api.heroiclands.org)
    aliases: []
id: 0GAX0u0CJSY9EsNe
slug: api-docs-hosting
type: doc
package: sohl
category: dev-docs
folder: null
---

# API Docs Hosting (api.heroiclands.org)

See also: [Getting Started](../how-to/getting-started.md), [Testing](../how-to/testing.md)

The TypeDoc API reference is published to **https://api.heroiclands.org** by the [`deploy-docs.yml`](../../../.github/workflows/deploy-docs.yml) workflow. **One version is published: the current release, unversioned, at the site root.** Older versions are not mirrored — the git tags are the history, and the documentation for any release is reproducible from its tag with `npm run docs:html`.

## Site layout

```
api.heroiclands.org/    ← the TypeDoc build of the newest release, at the root
```

There are no per-ref subdirectories, no `/latest`, and no `/main`. A branch is never published; to read the docs for work in progress, build them locally (`npm run docs:html`, then `npm run docs:serve`).

The branch root also carries `.nojekyll` (so generated folders aren't filtered by Jekyll), rewritten on every publish, and `CNAME`, which is **preserved rather than written** — GitHub Pages maintains that file from the repository's custom-domain setting, and deleting it would unset the domain.

## How publishing works

The docs are served by GitHub Pages from the **`gh-pages` branch** (Pages source: _Deploy from a branch → `gh-pages` → `/ (root)`_). The workflow:

1. asks the GitHub API for the newest published release and **checks out that tag** — the ref that triggered the run is irrelevant;
2. builds the HTML from it (`npm run docs:prepare && npm run docs:html`, output in `build/docs-html`);
3. replaces the entire `gh-pages` tree with that build, preserving only `.git` and `CNAME`;
4. pushes — or, when the build is byte-identical to what is already published, does nothing.

It runs on two events:

| Trigger                          | What it publishes                       |
| -------------------------------- | --------------------------------------- |
| "Version and Release" completed  | the newest release, at the root         |
| `workflow_dispatch` (manual)     | the newest release, at the root         |

Both do the same thing, because the tag is resolved from the API rather than from the event.

**Why `workflow_run` and not `release:`.** [`release.yml`](../../../.github/workflows/release.yml) creates its GitHub Release with the Actions `GITHUB_TOKEN`, which by design cannot trigger another workflow — so a `release: [published]` trigger would never fire for an automated release. Keying off the release **run** instead sidesteps that rule without a PAT. Nothing is passed between the two workflows; the docs job resolves the tag itself. A run that released nothing therefore rebuilds the tag already published, finds no diff, and exits without pushing.

Runs share the `gh-pages-deploy` concurrency group, so they serialize and never race on the branch.

## Republishing by hand

There is nothing to select — the newest release is always what gets built:

```bash
gh workflow run deploy-docs.yml
```

Use this after fixing a documentation build, or if the automatic run failed. The **Run workflow** button in the Actions tab does the same thing.

## Cloudflare cache purge

`api.heroiclands.org` is fronted by Cloudflare. When the record is proxied, Cloudflare caches the docs, so a fresh publish would otherwise stay hidden behind stale cache until the TTL expires. After every successful publish, the workflow calls the Cloudflare API to purge the cache so new docs appear immediately.

This requires two repository secrets (**Settings → Secrets and variables → Actions**); the purge step skips cleanly if either is missing, so the workflow still succeeds before they are configured:

- `CLOUDFLARE_ZONE_ID` — the Zone ID for `heroiclands.org` (Cloudflare dashboard → the domain → **Overview**, right-hand sidebar).
- `CLOUDFLARE_PURGE_TOKEN` — an API token scoped to **Zone → Cache Purge → Purge** for that zone (Cloudflare → **My Profile → API Tokens → Create Token**).

The purge uses `purge_everything`, which clears the **entire `heroiclands.org` zone** — including the main site — not just the `api.` host. That is harmless (cache simply rebuilds on the next request) but broader than necessary. Host-scoped purges (`hosts: ["api.heroiclands.org"]`) and prefix purges are Cloudflare **Enterprise**-only; on lower plans, `purge_everything` is the reliable choice.

## Operational notes

- **Pages source must stay on the `gh-pages` branch.** Do not switch it to "GitHub Actions" — the workflow publishes by pushing to the branch.
- **The `gh-pages` branch is disposable.** It holds one build and no history worth keeping; it can be recreated from scratch by dispatching the workflow.
- **The root is replaced wholesale.** Anything committed to `gh-pages` by hand is removed on the next publish, `CNAME` excepted.
- **Custom domain / DNS** for `api.heroiclands.org` is configured once (DNS record + Pages custom domain) and is unaffected by ordinary publishes.
