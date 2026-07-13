---
"sohl": minor
---

**Feature: the namespace tree is now live on the `sohl` global (#403)**

Every SoHL class is now addressable at runtime by a source-mirroring path on the
`sohl` global — `sohl.document.effect.foundry.SohlActiveEffect`,
`sohl.entity.modifier.ValueModifier`, `sohl.apps.foundry.DomainManagerApp`, and so
on. The top-level namespaces `sohl.document`, `sohl.core`, and `sohl.apps` are new;
they are typed on `SohlSystem` (via `typeof import(...)`, so the binding adds no
import cycle) and bound in `sohl.ts` (the last-loaded entry, imported by nothing).

`sohl.entity` is now **both** its existing override-aware construction registry
(`sohl.entity.ValueModifier`, `sohl.entity.register(...)` — unchanged, so existing
macros keep working) **and** a namespace (`sohl.entity.modifier.ValueModifier`).
The flat PascalCase getters and lowercase sub-namespaces occupy distinct property
names, so both coexist. Construct or override through the flat registry (its
getters honor a `register()` override); the namespace path is for reference and
always resolves to the original class.

Additive throughout — existing `@src/…` imports and the current `sohl` surface are
unchanged. The `sohl.utils` / `sohl.constants` surfaces are left as-is for now
(they overlap the existing curated members); their namespace form is deferred.
