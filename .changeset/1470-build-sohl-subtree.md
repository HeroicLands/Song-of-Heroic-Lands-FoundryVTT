---
"sohl": patch
---

**This repository now builds and deploys the whole of `/sohl/` as one site.**
What used to be two deployments on two hosting platforms — the knowledgebase at
`kb.heroiclands.org` and the API documentation at `api.heroiclands.org` — is one
standalone subtree of `www.heroiclands.org`, built and published by one workflow
(#1444).

**What is published where**

| Address      | What                                     | Built from             |
| ------------ | ---------------------------------------- | ---------------------- |
| `/sohl/`     | A landing page for the package           | `main`                 |
| `/sohl/kb/`  | The knowledgebase, unchanged in content  | `main`                 |
| `/sohl/api/` | The API documentation, mounted as a tree | the newest release tag |

**The deploy**

- `deploy-kb.yml` becomes `deploy-sohl.yml` and publishes all three surfaces in
  one run. A Cloudflare Pages deploy replaces the whole tree, so both halves are
  rebuilt every run — publishing one alone would take the other offline.
- The deployment carries the `/sohl/` prefix **physically**
  (`build/site/sohl/…`), so every link resolves at the hosting project's own
  address exactly as it will at `www`, and the routing layer that composes the
  hostname (#1468) has nothing to rewrite.
- `utils/build-site.mjs` (`npm run site:assemble`) mounts the TypeDoc output and
  refuses to finish unless the landing page, the knowledgebase, the API
  documentation and the `404.html` are all present. `npm run build:site` builds
  the lot locally.
- Hugo renders into `build/site/sohl/` rather than `kb/public/`, and cleans its
  destination, so a stale page from an earlier layout can no longer be deployed.

**Knowledgebase changes**

- Content is generated into `kb/content/kb/`, and every generated link and
  manifest entry carries the mount.
- Section landings that Hugo used to generate for free are now written by the
  build, so an address does not silently stop existing while every page inside
  it keeps working. `macro`'s heading loses Hugo's inflection — it reads
  "Macros", not "Macroes".
- Per-type listing layouts select on the frontmatter `type` rather than the Hugo
  section, which is now `kb` for every page.
- The knowledgebase hero banner pointed at a CDN path that 404s
  (`images/sohl-banner.webp`); it now resolves.
- The shared theme is bumped for its own fix to the breadcrumb's middle crumb,
  which composed `/{package}/{section}/` — an address only a site publishing
  several packages as path segments has. It was dead on all 1,450 content
  pages before this and would have doubled the prefix after it.
- `deploy-docs.yml` and `gh-pages` still run and still serve `api.heroiclands.org`.
  Retiring them is #1456, deliberately later.

(Closes #1470.)
