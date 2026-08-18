---
"sohl": patch
---

**Every link to `kb.heroiclands.org` and `api.heroiclands.org` now points at
where those pages actually live.** Both hostnames have been withdrawn, so these
were dead links, not merely dated ones — including two the system itself ships.

**In the shipped system**

- The **Game System** links in Foundry's settings sidebar. `system.json` carried
  a knowledgebase URL on a retired host and an API URL composed as
  `<host>/v<version>`, an address that stopped existing when the documentation
  became a single unversioned tree (#1452). `package.json` now carries the
  finished address (`apiDocsBaseUrl` → `apiDocsUrl`), and the build uses it as
  given rather than composing a version onto it. Both suites that assert those
  links assert the new ones.

**In the generated API documentation**

- Its own masthead pointed at both retired hosts, and at a project page
  (`/projects/sohl/`) that 404s. All three now resolve.
- The home page's links to the Architecture Overview and Getting Started omitted
  the `/dev-docs/` section and had been dead independently of the move.

**In the documentation**

- JSDoc across `src/` (17 files), `CONTRIBUTING.md`, the developer docs, and the
  build utilities. `CONTRIBUTING.md`'s three "published on the website" links
  pointed at TypeDoc `documents/…` pages, an arrangement that ended when the
  prose moved to the knowledgebase; they now point at the pages that hold the
  material.
- The "Player & GM rules" links pointed at the site's own `/sohl/` guide pages,
  retired when the site stopped publishing the package. They now point at the
  knowledgebase's user guide and rules.
- The convention for a JSDoc → doc-page link is stated once, in
  [System Development](https://www.heroiclands.org/sohl/kb/dev-docs/contributing/system-development/),
  and now names the current address.

Every rewritten URL was fetched: all 32 distinct addresses this repository emits
resolve.

(Closes #1455.)
