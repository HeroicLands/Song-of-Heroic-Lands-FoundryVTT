---
"sohl": patch
---

**The knowledgebase's API links resolve again.** `kb/data/api-symbols.json` maps
each qualified symbol name to its API page URL so the knowledgebase can resolve
`{@link sohl.*}` references without running TypeDoc. It was being emptied on
every documentation build, and the copy in the repository had drifted.

TypeDoc 0.28 moved URL ownership off the reflection and onto a router:
`reflection.url` is no longer populated. The symbol-map plugin still read that
property, so every symbol failed its `if (refl.url)` guard, the walk completed
without recording anything, and a well-formed empty map was written — logged as
"wrote 0 entries" at info level, with a zero exit code. Since `npm run docs` is a
pre-commit gate, following it and committing blanked the file; the deploy job
published the empty map for the same reason.

URLs now come from `app.renderer.router` (`hasUrl` / `getFullUrl`), which is the
supported way to ask for a page address in 0.28 and restores all 5405 entries.

Two consequences worth naming. The regenerated map **corrects 875 URLs**: nothing
had successfully rebuilt it since the 0.28 upgrade, so those entries still pointed
at pre-0.28 disambiguated filenames (`…SohlContextMenu-1.html`) that the renderer
no longer emits — links into the API site that could not land. And the plugin now
**throws** if it resolves no symbols, or if the renderer exposes no router, rather
than overwriting the committed file with `{}`; a silent success that produced
nothing is what let this run undetected.

(Closes #1610.)
