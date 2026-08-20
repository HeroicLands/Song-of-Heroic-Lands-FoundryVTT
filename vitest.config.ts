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
        // Two projects, so a single `npm run test` still runs everything CI
        // gates on while `@heroiclands/content-build` stays verifiable on its
        // own (#1511). The package's project is its own config file — the same
        // one `npm test -w @heroiclands/content-build` loads — so the two entry
        // points can never run different suites.
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
            "./packages/content-build/vitest.config.ts",
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
