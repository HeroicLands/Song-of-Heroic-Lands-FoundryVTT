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
        // One project. This repository consumes `@heroiclands/package-build`
        // from the registry, exactly as any other consumer resolves it, and it
        // does not run its own suite from this config.
        //
        // What remains here in `tests/build/` asserts the *agreements* between
        // this repository and that package — the facts neither side can check
        // alone, such as the shortcode rule the runtime restates because shipped
        // code cannot import a devDependency.
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
        ],
        coverage: {
            reporter: ["text", "html"],
            reportsDirectory: "build/coverage",
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
