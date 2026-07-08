---
"sohl": minor
---

**Let variant modules override per-kind Logic classes**

Exposes the base actor/item Logic classes at runtime and adds registration so a
variant module can subclass and swap them:

- `sohl.actorLogicClasses` / `sohl.itemLogicClasses` — kind → base Logic class,
  for subclassing.
- `sohl.registerActorLogic(kind, cls)` / `sohl.registerItemLogic(kind, cls)` —
  override the class used to build every document of that kind.

The resolution path (`SohlDataModel.create`) already reads these maps, so no
construction sites change — a document prepared after registration uses the
registered class. Register during a module's `init`/`setup` hook, before the
first `.logic` for that kind is built.

Part of #80. Closes #82.
