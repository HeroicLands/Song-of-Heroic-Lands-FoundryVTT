/// <reference types="vite/client" />
import { describe, it } from "vitest";

/**
 * Logic-layer purity smoke test.
 *
 * Imports every module in the Foundry-free zones — the item/actor logic
 * layers, the domain layer, and the pure core files — in an environment with
 * NO Foundry globals (no `foundry`, `game`, `Item`, `Actor`, `canvas`, ...).
 * A module that evaluates any Foundry global at load time throws here.
 *
 * This is the runtime backstop for the ESLint boundary rule in
 * eslint.config.js: the lint rule catches direct value imports of
 * Foundry-coupled modules; this test catches anything the pattern list
 * misses (including transitive leaks).
 *
 * `sohl` is the system's own global namespace (logger/i18n), not a Foundry
 * global; modules may reference it inside function bodies but must not
 * dereference it at module level. It is intentionally absent here too.
 */

const PURE_ZONES: Record<string, Record<string, () => Promise<unknown>>> = {
    "core (pure files)": import.meta.glob(
        [
            "../../src/core/SohlLogic.ts",
            "../../src/core/SohlActionContext.ts",
            "../../src/core/SohlSpeaker.ts",
            "../../src/core/SohlEventTrigger.ts",
        ],
        { eager: false },
    ),
    "utils/ContextMenuEntry": import.meta.glob(
        "../../src/utils/ContextMenuEntry.ts",
        { eager: false },
    ),
    "item logic layer": import.meta.glob(
        "../../src/document/item/logic/**/*.ts",
        { eager: false },
    ),
    "actor logic layer": import.meta.glob(
        "../../src/document/actor/logic/**/*.ts",
        { eager: false },
    ),
    "combatant logic layer": import.meta.glob(
        "../../src/document/combatant/logic/**/*.ts",
        { eager: false },
    ),
    "combat logic layer": import.meta.glob(
        "../../src/document/combat/logic/**/*.ts",
        { eager: false },
    ),
    "token logic layer": import.meta.glob(
        "../../src/document/token/logic/**/*.ts",
        { eager: false },
    ),
    "scene logic layer": import.meta.glob(
        "../../src/document/scene/logic/**/*.ts",
        { eager: false },
    ),
    "effect logic layer": import.meta.glob(
        "../../src/document/effect/logic/**/*.ts",
        { eager: false },
    ),
    "apps logic layer": import.meta.glob("../../src/apps/logic/**/*.ts", {
        eager: false,
    }),
    "domain layer": import.meta.glob("../../src/domain/**/*.ts", {
        eager: false,
    }),
};

for (const [zone, modules] of Object.entries(PURE_ZONES)) {
    const paths = Object.keys(modules);
    describe(`${zone} is importable without Foundry globals`, () => {
        if (paths.length === 0) {
            it("matches at least one module", () => {
                throw new Error(
                    `No modules matched for zone "${zone}" — check the glob patterns.`,
                );
            });
            return;
        }
        for (const path of paths) {
            it(path.replace("../../", ""), async () => {
                await modules[path]();
            });
        }
    });
}
