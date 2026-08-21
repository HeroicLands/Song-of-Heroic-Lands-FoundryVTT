import { defineConfig } from "vitest/config";
import path from "path";

const isTest = process.env.VITEST === "true";

export default defineConfig({
    resolve: {
        alias: [
            // FoundryHelpers must come before the general @src/* alias
            // so the test mock takes precedence during testing
            ...(isTest ?
                [
                    {
                        find: "@src/core/FoundryHelpers",
                        replacement: path.resolve(
                            __dirname,
                            "tests/mocks/foundry/core/FoundryHelpers.ts",
                        ),
                    },
                ]
            :   []),
            {
                find: /^@types\/(.*)/,
                replacement: path.resolve(__dirname, "types/$1"),
            },
            {
                find: /^@src\/(.*)/,
                replacement: path.resolve(__dirname, "src/$1"),
            },
            {
                find: /^@templates\/(.*)/,
                replacement: path.resolve(__dirname, "templates/$1"),
            },
            {
                find: /^@assets\/(.*)/,
                replacement: path.resolve(__dirname, "assets/$1"),
            },
            {
                find: /^@lang\/(.*)/,
                replacement: path.resolve(__dirname, "lang/$1"),
            },
            {
                find: /^@tests\/(.*)/,
                replacement: path.resolve(__dirname, "tests/$1"),
            },
        ],
    },
    test: {
        // Two projects, for two different kinds of suite.
        //
        // `system` is this repository's own. `@heroiclands/content-build` used
        // to be a second project, pointing at the copy vendored under
        // `packages/`; it is now developed in its own repository and consumed
        // from the registry like every other consumer resolves it (#1589), so
        // its suite runs there. What remains here in `tests/build/` asserts the
        // agreements between this repository and that package — the facts
        // neither side can check alone.
        //
        // `package-build` is the same arrangement content-build had *before*
        // that extraction: an incubating shared package, developed here until
        // it has a working consumer and then moved to its own repository. Its
        // suite sits beside it under `packages/` rather than in `tests/`, so it
        // moves with the package instead of being left behind — which is the
        // one thing the content-build extraction had to untangle by hand.
        //
        // It gets no `setupFiles`: the package is Foundry-free build tooling,
        // and loading `tests/setup.ts` would hand it the Foundry global stubs,
        // letting a dependency on them pass here and fail for a consumer.
        projects: [
            {
                extends: true,
                test: {
                    name: "system",
                    globals: true,
                    environment: "node",
                    setupFiles: ["./tests/setup.ts"],
                    include: ["tests/**/*.test.ts"],
                },
            },
            {
                extends: true,
                test: {
                    name: "package-build",
                    globals: true,
                    environment: "node",
                    include: ["packages/package-build/tests/**/*.test.ts"],
                },
            },
        ],
        coverage: {
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: [
                // Foundry-dependent code (DataModel, Sheet, Document classes)
                "src/**/foundry/**",
                "src/**/SohlDataModel.ts",
                // Build tooling and dev utilities
                "src/utils/ai/**",
                "src/utils/SohlContextMenu.ts",
                "src/utils/SourceMapResolver.ts",
                // Entry point and system registration (integration-level)
                "src/sohl.ts",
                // Foundry shim (tested via mock swap, not directly)
                "src/core/FoundryHelpers.ts",
            ],
        },
    },
});
