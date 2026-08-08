---
"sohl": patch
---

**Fix the system failing to load with `Identifier 'chrome' has already been declared`**

Installing the released system threw a `SyntaxError` on load and the system never
initialized:

```
Uncaught SyntaxError: Identifier 'chrome' has already been declared (at sohl.js:1:1)
```

**The cause was a mismatch between how `sohl.js` is built and how it is loaded.**
Vite builds the bundle as an **ES module**, but `system.json` listed it under
`"scripts"`, which makes Foundry load it as a **classic script**. The distinction
decides where top-level declarations live: in a module they are module-scoped and
private to the bundle; in a classic script they become _global lexical_ bindings.

A global lexical binding whose name matches a **non-configurable** property of
`window` is a parse-time `SyntaxError` — thrown before a single line executes. The
bundle inlines `@codemirror/view` for the SafeExpression editor, and that library
declares `const chrome` for browser sniffing. `window.chrome` is
`configurable: false`, so the collision bricked the entire system. The release
build is deliberately unminified, so the identifier survived verbatim; Foundry's
own CodeMirror build escapes the same problem only because minification renames it.

`sohl.js` is now declared under **`"esmodules"`**, matching how it is built. Every
top-level declaration is module-scoped again, so this class of collision cannot
recur — the same latent failure also affected `style-mod`'s `const top`, which had
previously been worked around by renaming that one identifier at build time. That
workaround is removed, as module scope subsumes it.

A build guard, `npm run lint:bundle-globals`, now fails the build if the manifest
and the bundle format ever disagree again: if `sohl.js` is served as a classic
script, it must declare nothing at global scope.
