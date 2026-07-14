---
"sohl": patch
---

**KB: rewrite relative `*.md` and source links in the developer docs (#437)**

The knowledgebase developer docs are authored with repo-relative links that don't
exist in the rendered site; they now resolve. The content-prep step
(`utils/build-kb-content.mjs`) rewrites each relative link against the doc's own
location under `docs/`:

- a `*.md` target under `docs/` → the KB dev route (`/dev/<path>/`), preserving any
  `#anchor`.
- source / config / repo-root `*.md` (e.g. `src/**`, `lang/en.json`, `package.json`,
  `CONTRIBUTING.md`) → its GitHub blob URL.
- absolute, anchor-only, `mailto:`, and site-root links are left untouched.

Rewriting (and `{@link}` resolution) is guarded to skip fenced code blocks and
inline code spans, so a `](`-bearing code example — e.g. a `'return this'` exploit
snippet, or a `` `{@link Symbol}` `` syntax illustration — is left verbatim. This
completes the port of the retired Astro KB's link rewriting to Hugo.
