import {
    defineConfig,
    type PluginOption,
    type UserConfig,
    type ConfigEnv,
} from "vite";
import { fileURLToPath } from "url";
import path from "path";
import banner from "vite-plugin-banner";
const startYear = 2025;
const currentYear = new Date().getFullYear();
const licenseYears =
    currentYear > startYear ? `${startYear}-${currentYear}` : `${startYear}`;

const __filename = fileURLToPath(import.meta.url);
const licenseBanner = `/*!
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright (c) ${licenseYears} by Tom Rodriguez
 */`;

export default defineConfig((ctx: ConfigEnv): UserConfig => {
    const isRelease = ctx.mode === "release";

    return {
        root: ".",
        plugins: [banner(licenseBanner)] satisfies PluginOption[],
        build: {
            outDir: path.resolve(__dirname, "build/stage"),
            emptyOutDir: false,
            target: "es2020",
            sourcemap: isRelease,
            minify: isRelease ? "esbuild" : false,
            rollupOptions: {
                input: path.resolve(__dirname, "src/foundry/index.mjs"),
                output: {
                    entryFileNames: "[name].js",
                    chunkFileNames: "[name].js",
                    assetFileNames: "[name][extname]",
                    banner: licenseBanner,
                },
            },
        },
        resolve: {
            extensions: [".ts", ".js", ".json"],
            alias: {
                "@types/*": path.resolve(__dirname, "types"),
                "@utils": path.resolve(__dirname, "src/utils"),
                "@utils/*": path.resolve(__dirname, "src/utils"),
                "@foundry": path.resolve(__dirname, "src/foundry"),
                "@foundry/*": path.resolve(__dirname, "src/foundry"),
                "@logic": path.resolve(__dirname, "src/logic"),
                "@logic/*": path.resolve(__dirname, "src/logic"),
                "@templates/*": path.resolve(__dirname, "templates"),
                "@assets/*": path.resolve(__dirname, "assets"),
                "@lang/*": path.resolve(__dirname, "lang"),
                "@tests/*": path.resolve(__dirname, "tests"),
                "@sohl-global": path.resolve(
                    __dirname,
                    "types/sohl-global.d.ts",
                ),
            },
        },
    };
});
