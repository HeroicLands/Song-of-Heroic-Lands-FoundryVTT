---
"sohl": patch
---

**KB: resolve `{@link}` and source links to the API site and GitHub (#428)**

The knowledgebase developer docs now cross-link properly instead of rendering
dead references. A new TypeDoc plugin (`utils/typedoc-plugin-symbol-map.mjs`)
emits a `qualified name → API page URL` map during the docs build
(`kb/src/api-symbols.json`, committed), using TypeDoc's own `reflection.url` so
disambiguation suffixes and member anchors are exact. The KB loader then rewrites,
per docs page:

- `{@link sohl.*}` → a link to the symbol's page on api.heroiclands.org (member
  links included); references that name no documented symbol (syntax examples)
  fall back to a code span.
- relative source-file links (`../../src/*.ts`, `package.json`, `lang/en.json`, …)
  → the GitHub blob URL.

Relative `*.md` links continue to resolve to KB routes. With #427 (API generated-
only), this completes the api/kb split.
