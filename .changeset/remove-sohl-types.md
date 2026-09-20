---
"sohl": patch
---

**The types package is no longer published to npm.** TypeScript authors
writing against the `sohl` global no longer have a generated `@types`
package to install; a module still reaches every runtime value through the
live `sohl` global the same way it always has.
