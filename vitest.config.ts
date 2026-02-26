import { defineConfig } from "vitest/config";
import path from "path";

const isTest = process.env.VITEST === "true";

export default defineConfig({
    resolve: {
        alias: {
            "@common/foundry-helpers":
                isTest ?
                    "/tests/mocks/foundry/core/foundry-helpers.mjs"
                :   "/src/common/foundry-helpers.mjs",
        },
    },
    test: {
        globals: true,
        environment: "node",
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/**/*.test.ts"],
        coverage: {
            reporter: ["text", "html"],
        },
        alias: {
            "@types/*": path.resolve(__dirname, "types"),
            "@utils/helpers": path.resolve(__dirname, "src/utils"),
            "@utils/*": path.resolve(__dirname, "src/utils"),
            "@foundry": path.resolve(__dirname, "src/foundry"),
            "@foundry/*": path.resolve(__dirname, "src/foundry"),
            "@logic": path.resolve(__dirname, "src/logic"),
            "@logic/*": path.resolve(__dirname, "src/logic"),
            "@templates/*": path.resolve(__dirname, "templates"),
            "@assets/*": path.resolve(__dirname, "assets"),
            "@lang/*": path.resolve(__dirname, "lang"),
            "@tests/*": path.resolve(__dirname, "tests"),
            "@sohl-global": path.resolve(__dirname, "types/sohl-global.d.ts"),
        },
    },
});
