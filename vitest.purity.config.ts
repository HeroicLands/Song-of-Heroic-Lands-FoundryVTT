import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Purity harness: verifies that the logic layer is loadable WITHOUT the
 * Foundry global stubs that tests/setup.ts installs for the main suite.
 *
 * Every module under the logic/domain layers (plus the pure core files) is
 * dynamically imported in a bare Node environment where `foundry`, `game`,
 * `Item`, `Actor`, etc. do not exist. Any module-level access to a Foundry
 * global throws and fails the suite. Only the sanctioned FoundryHelpers
 * shim is aliased to its test mock — the same swap the main suite uses.
 *
 * Run via `npm run test:purity`; part of `build:noci`.
 */
export default defineConfig({
    resolve: {
        alias: [
            // The FoundryHelpers shim mock is the ONLY substitution allowed —
            // it is the sanctioned boundary for Foundry API access.
            {
                find: "@src/core/FoundryHelpers",
                replacement: path.resolve(
                    __dirname,
                    "tests/mocks/foundry/core/FoundryHelpers.ts",
                ),
            },
            {
                find: /^@src\/(.*)/,
                replacement: path.resolve(__dirname, "src/$1"),
            },
            {
                find: /^@tests\/(.*)/,
                replacement: path.resolve(__dirname, "tests/$1"),
            },
        ],
    },
    test: {
        globals: true,
        environment: "node",
        // Deliberately NO setupFiles: no foundry/game/Item/Actor globals.
        include: ["tests/purity/**/*.purity.ts"],
    },
});
