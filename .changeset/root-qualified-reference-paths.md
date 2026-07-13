---
"sohl": patch
---

**Docs: root qualified type-reference paths at `sohl` (#415)**

In the API docs, when TypeDoc disambiguates a colliding reference name (e.g. the
many nested `Data` types) it renders the target's namespace path — but the theme
dropped the root, so a signature read `entity.action.SohlAction.Data` instead of
the honest, `sohl`-rooted `sohl.entity.action.SohlAction.Data` that matches the
breadcrumb, the sidebar, and the runtime `sohl.*` global.

The default theme's path walk includes only `Namespace`-kind ancestors and stops
at the entry-point **module** — and `src/index.ts` is `@module sohl`, so `sohl`
was excluded. A new TypeDoc plugin (`utils/typedoc-plugin-root-namespace.mjs`,
loaded by both the HTML and Markdown configs) retags the entry-point module as a
namespace at resolve-time, so the walk carries `sohl` as the root segment. Page
URLs, navigation, and breadcrumbs are unchanged; the only other effect is the
root page heading now reads "Namespace sohl", consistent with every child
namespace this barrel contains.
