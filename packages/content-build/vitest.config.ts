import { defineConfig } from "vitest/config";

/**
 * The package's own test harness.
 *
 * `@heroiclands/content-build` is verifiable on its own: `npm test -w
 * @heroiclands/content-build` loads this config directly, and the repository's
 * root `vitest.config.ts` references the same file as one of its projects, so
 * the two runs are the same suite (#1511).
 *
 * Deliberately austere. There is no `tests/setup.ts` and no `@src` alias: the
 * pack pipeline is Foundry-free and severed from the system source (#1510), and
 * a harness that offered either would let that severance rot. A test that needs
 * the runtime is a *repository* test and belongs in `tests/build/`.
 */
export default defineConfig({
    test: {
        name: "content-build",
        globals: true,
        environment: "node",
        include: ["tests/**/*.test.ts"],
    },
});
