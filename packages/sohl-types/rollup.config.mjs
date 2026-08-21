import dts from "rollup-plugin-dts";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
);
const DTS = path.join(root, "build/dts/src");

// The published package's own `peerDependencies` are the single declaration of
// what stays external. Deriving `external` from them means a third-party module
// can only leak into `index.d.ts` as a bare import if the package also promises
// consumers it will be there (#1613) — `utils/check-sohl-types.mjs` enforces the
// other direction, that every emitted bare import is one of these.
const PEERS = Object.keys(
    JSON.parse(
        fs.readFileSync(
            path.join(root, "packages/sohl-types/package.json"),
            "utf8",
        ),
    ).peerDependencies ?? {},
);
const isPeer = (id) => PEERS.some((p) => id === p || id.startsWith(`${p}/`));

// Resolve `@src/x` to the tsc-emitted declaration (file, else the folder barrel).
const srcAlias = {
    name: "src-alias",
    resolveId(id) {
        if (!id.startsWith("@src/")) return null;
        const base = path.join(DTS, id.slice(5));
        const asFile = base + ".d.ts";
        if (fs.existsSync(asFile)) return asFile;
        const asIndex = path.join(base, "index.d.ts");
        if (fs.existsSync(asIndex)) return asIndex;
        return asFile;
    },
};

export default {
    input: path.join(root, "build/dts/packages/sohl-types/generate/entry.d.ts"),
    output: {
        file: path.join(root, "packages/sohl-types/index.d.ts"),
        format: "es",
        banner: [
            "/*",
            " * @heroiclands/sohl-types — public type declarations for the Song of Heroic",
            " * Lands (SoHL) Foundry VTT system. GENERATED — do not edit by hand.",
            " * Rebuild with `npm run build:sohl-types`. Types only; runtime binds through",
            " * the live `sohl` global. `fvtt-types` is a peer dependency (Foundry globals).",
            " *",
            " * SPDX-License-Identifier: GPL-3.0-or-later",
            " */",
        ].join("\n"),
    },
    plugins: [srcAlias, dts({ respectExternal: false })],
    external: isPeer,
};
