---
"sohl": minor
---

**Make every entity class overridable via a two-mechanism registry**

Completes the `sohl.entity` registry so a variant module can subclass any
registered entity class and have that subclass built everywhere, and routes
_all_ construction through the registry so no site silently bypasses an override.

**The override API**

- `sohl.entity.register(name, cls)` — install an override. `cls` must extend (or
  be) the canonical base for `name`; the call throws on an unknown name, a class
  that does not extend the base, or a base that has not yet loaded. Call it from
  a module's `init`/`setup` hook, before the first construction of that class.
- `sohl.entity.base(name)` — the canonical SoHL base for `name`, ignoring any
  override, for a module that wants to extend the original.

**Two construction mechanisms**

- **Inside SoHL** — `import { entity }` then `new entity.X(...)`. A static import
  that resolves through the module graph, so unit tests construct these classes
  with no runtime global wired.
- **Outside SoHL** (macros / variant modules) — the same surface on the runtime
  global: `new sohl.entity.X(...)` and `sohl.entity.register(...)`.

Both read one backing record, so an override is honored no matter which
constructs the object.

**How it fits together**

Classes self-register (`registerEntity("X", X)`, mirroring `registerKind`) into a
cycle-free leaf (`entityRegistry.ts`) that value-imports none of them. `registry.ts`
is an eager-load barrel that pulls in every class module and re-exports the
surface; most internal code imports `entity` from it. The handful of base classes
whose own subclasses are registered import the leaf directly (the barrel would
evaluate `class Sub extends Base` mid-load) and add bare side-effect imports of
their construction targets.

An ESLint `no-restricted-syntax` rule bans a bare `new` of any registered entity
class so the discipline holds; the member-expression forms `new entity.X` /
`new sohl.entity.X` pass. The mechanisms are documented under **Entity class
registry** in `docs/reference/runtime-contracts.md`.

Closes #83 — the final task of epic #80.
