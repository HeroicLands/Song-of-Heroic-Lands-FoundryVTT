/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * CI guard: validate the generated `packages/sohl-types/index.d.ts` as the
 * artifact a *consumer* installs, rather than as a file that happens to compile
 * here.
 *
 * `tsc -p packages/sohl-types/test/tsconfig.json` type-checks the bundle from
 * inside this repository, where every third-party module it imports resolves
 * from the root `node_modules` whether or not the package declares it. That is
 * the blind spot #1613 was made of: a broken types package looked fine from the
 * only place anyone looked. These checks are the ones that only make sense from
 * the outside.
 *
 * What it asserts:
 *
 *   1. Every bare module the bundle imports is declared in the package's
 *      `peerDependencies` — so an install actually resolves it.
 *   2. No synthesized private names (`__#N@#member`). TypeScript emits these
 *      when a declaration's inferred type references a `#private` member, and
 *      no downstream `.d.ts` consumer — including `rollup-plugin-dts` — can
 *      parse them. Fix by annotating the offending declaration's type.
 *   3. Every name the bundle re-exports is actually declared in it, and the
 *      `sohl` global is typed. An empty or hollowed-out bundle is worse than a
 *      failed build, because it degrades consumers to `any` in silence.
 *
 * Usage:
 *   npm run check:sohl-types      // builds, type-checks, then runs this
 *   node utils/check-sohl-types.mjs
 */
import fs from "node:fs";
import { emitDiagnostic } from "@heroiclands/package-build/engine/diagnostics";
import path from "node:path";

const PKG_DIR = path.resolve("packages/sohl-types");
const BUNDLE = path.join(PKG_DIR, "index.d.ts");

const errors = [];
const fail = (msg) => errors.push(msg);

if (!fs.existsSync(BUNDLE)) {
    console.error(
        `Missing ${path.relative(process.cwd(), BUNDLE)} — run \`npm run build:sohl-types\` first.`,
    );
    process.exit(1);
}

const dts = fs.readFileSync(BUNDLE, "utf8");
const pkg = JSON.parse(
    fs.readFileSync(path.join(PKG_DIR, "package.json"), "utf8"),
);
const peers = Object.keys(pkg.peerDependencies ?? {});
const isPeer = (id) => peers.some((p) => id === p || id.startsWith(`${p}/`));

// 1. Bare imports must be declared peers.
const specifiers = new Set();
for (const m of dts.matchAll(
    /^\s*(?:import|export)\b[^;]*?\bfrom\s+["']([^"']+)["']/gm,
)) {
    specifiers.add(m[1]);
}
for (const spec of [...specifiers].sort()) {
    if (spec.startsWith(".") || spec.startsWith("/")) {
        fail(
            `index.d.ts imports the relative path "${spec}" — the bundle must be self-contained.`,
        );
    } else if (!isPeer(spec)) {
        fail(
            `index.d.ts imports "${spec}", which is not a peerDependency of ` +
                `@heroiclands/sohl-types. Consumers would not resolve it. ` +
                `Declare it in packages/sohl-types/package.json (the rollup ` +
                `\`external\` set is derived from that list), or keep the type ` +
                `out of the published surface.`,
        );
    }
}

// 2. No unparseable synthesized private names.
for (const m of dts.matchAll(/__#\d+@#[A-Za-z0-9_$]+/g)) {
    fail(
        `index.d.ts contains the synthesized private name "${m[0]}", which no ` +
            `.d.ts consumer can parse. Annotate the declaration whose inferred ` +
            `type references that #private member.`,
    );
}

// 3. Everything re-exported is actually declared, and the global is typed.
const declared = new Set();
for (const m of dts.matchAll(
    /^declare\s+(?:abstract\s+)?(?:class|interface|type|enum|const|function|namespace|var|let)\s+([A-Za-z0-9_$]+)/gm,
)) {
    declared.add(m[1]);
}
for (const m of dts.matchAll(/^\s*(?:interface|type)\s+([A-Za-z0-9_$]+)/gm)) {
    declared.add(m[1]);
}

const exported = new Set();
for (const m of dts.matchAll(/^export\s+(?:type\s+)?\{([^}]*)\}\s*;/gm)) {
    for (const part of m[1].split(",")) {
        const name = part
            .trim()
            .split(/\s+as\s+/)[0]
            .trim();
        if (name) exported.add(name);
    }
}
if (exported.size === 0) {
    fail("index.d.ts re-exports nothing — the bundle is empty.");
}
for (const name of [...exported].sort()) {
    if (!declared.has(name)) {
        fail(
            `index.d.ts exports "${name}" but does not declare it — the ` +
                `declaration was dropped from the bundle, so consumers get an error.`,
        );
    }
}
if (!/declare global\s*\{[\s\S]*?\bvar sohl\s*:/.test(dts)) {
    fail(
        "index.d.ts does not declare the ambient `sohl` global — consumers " +
            "reach every runtime value through it.",
    );
}

if (errors.length > 0) {
    console.error(
        "The generated @heroiclands/sohl-types bundle would not work for a consumer:\n",
    );
    // The findings are about the generated bundle as a whole, so the file is
    // the honest locator and there is no line to add.
    for (const e of errors) {
        emitDiagnostic({ file: BUNDLE, severity: "error", message: e });
    }
    console.error(`\n${errors.length} problem(s).`);
    process.exit(1);
}

console.log(
    `✅ @heroiclands/sohl-types bundle is consumer-ready: ` +
        `${exported.size} exported names, all declared; ` +
        `${specifiers.size} external import(s), all declared peers.`,
);
