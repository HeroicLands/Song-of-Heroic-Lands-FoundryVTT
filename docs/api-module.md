The complete Song of Heroic Lands public API — every exported class, interface, type, function, and constant — organized as a **namespace tree** that mirrors the `src/` layout and the live `sohl` runtime global. A symbol's documentation path is its real location: `sohl.document.effect.foundry.SohlActiveEffect` is exactly where the class lives in the source and how you reach it at runtime.

Browse by namespace using the sidebar tree:

- **`sohl.apps`** — standalone application windows (settings, calendar, domain manager) and their Foundry-free view logic.
- **`sohl.core`** — system wiring and foundations: registration, config, the `SohlLogic` / `SohlSpeaker` / `SohlSystem` core, and the `FoundryHelpers` boundary.
- **`sohl.document`** — Foundry document types by kind (actor, item, effect, combat, combatant, chat, scene, token), each split into its Foundry-facing layer (`.foundry`) and its Foundry-free game logic (`.logic`).
- **`sohl.entity`** — Foundry-free domain entities macros and modules construct: modifiers, test and combat results, strike modes, actions, body modeling, expressions, and the event queue.
- **`sohl.utils`** — Foundry-free utilities: constants, collection types, and general helpers.

Every class, interface, and function keeps its home namespace, so a cross-reference such as {@link sohl.entity.modifier.ValueModifier} names the exact path you would import or reach through the runtime global. Constructable classes are also exposed on the override-aware flat registry (`sohl.entity.ValueModifier`); see the API Access Map guide for when to use each.

New here? Start with the **Architecture Overview** and **Getting Started** guides linked from the home page, which explain the mental model and the `src/` layout this API mirrors.
