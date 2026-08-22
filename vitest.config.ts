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
        // One project again. Both shared toolchains — `@heroiclands/content-build`
        // and `@heroiclands/package-build` — were once a second project here,
        // pointing at a copy incubating under `packages/`. Each is now developed
        // in its own repository and consumed from the registry exactly as any
        // other consumer resolves it (#1589), and each carries its own suite, so
        // neither runs from this config any more.
        //
        // What remains here in `tests/build/` asserts the *agreements* between
        // this repository and those packages — the facts neither side can check
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
