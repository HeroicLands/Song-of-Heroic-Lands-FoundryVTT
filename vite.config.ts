import { defineConfig, type UserConfig, type ConfigEnv } from "vite";
import { fileURLToPath } from "url";
import path from "path";

const startYear = 2024;
const currentYear = new Date().getFullYear();
const licenseYears = currentYear > startYear ? `${startYear}-${currentYear}` : `${startYear}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const licenseBanner = `/*!
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright (c) ${licenseYears} by Tom Rodriguez
 */`;

export default defineConfig((ctx: ConfigEnv): UserConfig => {
    return {
        root: ".",
        build: {
            outDir: path.resolve(__dirname, "build/stage"),
            emptyOutDir: false,
            target: "es2020",
            sourcemap: true,
            minify: false,
            lib: {
                entry: path.resolve(__dirname, "src/sohl.ts"),
                fileName: () => "sohl.js",
                // ESM — and `system.json` must load it as one, via `esmodules`
                // (never `scripts`). The two have to agree: loaded as a *classic
                // script*, every top-level `const`/`let`/`class` in this bundle
                // would become a global lexical binding, and one colliding with a
                // non-configurable `window` property throws
                // `SyntaxError: Identifier 'x' has already been declared` at parse
                // time — killing the whole system before a line runs. Bundled
                // dependencies do exactly that: `style-mod` declares `const top`
                // and `@codemirror/view` declares `const chrome`. Module scope
                // makes those declarations local and the collision impossible.
                // `lint:bundle-globals` enforces the agreement.
                formats: ["es"],
            },
            rollupOptions: {
                input: path.resolve(__dirname, "src/sohl.ts"),
                output: {
                    entryFileNames: "sohl.js",
                    banner: licenseBanner,
                },
            },
        },
        resolve: {
            extensions: [".ts", ".js", ".json"],
            alias: {
                "@types": path.resolve(__dirname, "types"),
                "@src": path.resolve(__dirname, "src"),
                "@templates": path.resolve(__dirname, "templates"),
                "@assets": path.resolve(__dirname, "assets"),
                "@lang": path.resolve(__dirname, "lang"),
                "@tests": path.resolve(__dirname, "tests"),
                "@sohl-global": path.resolve(__dirname, "types/sohl-global.d.ts"),
            },
        },
    };
});
