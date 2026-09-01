/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");

function readJson(rel: string): any {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

/** `tsconfig.*.json` is JSONC: strip comment lines and trailing commas first. */
function readJsonc(rel: string): any {
    const raw = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const stripped = raw
        .replace(/^\s*\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(stripped);
}

/**
 * The agreements that make `npm run build:sohl-types` produce a *usable*
 * `@heroiclands/sohl-types`. Both were broken silently for a full release cycle
 * (#1613): the build is not part of `build:noci`, and the release workflow's
 * publish step is `continue-on-error`, so neither direction surfaced it.
 *
 * These are static-configuration assertions — cheap, and they run in the normal
 * `npm run test` pass. The artifact itself is validated by
 * `utils/check-sohl-types.mjs` (`npm run check:sohl-types`), which needs the
 * build to have run.
 */
describe("the @heroiclands/sohl-types build contract", () => {
    it("does not strip @internal declarations out of the emitted types", () => {
        // `stripInternal` deletes every `@internal`-marked declaration from the
        // emitted `.d.ts` but leaves the `import type { … }` statements that the
        // *retained* public declarations still need — so `rollup-plugin-dts`
        // dies on the dangling reference ("SohlTokenDocument is not exported
        // by …"). TypeScript documents the flag as unsupported for exactly this
        // reason: it does no reachability check.
        //
        // It is also wrong for this package on its own terms. `@internal` here
        // means "not part of the public API *docs*" (a TypeDoc marker), and it
        // sits on the whole Foundry document layer — `SohlActor`, `SohlItem`,
        // `SohlScene`, `SohlTokenDocument`, `SohlActiveEffect`. Those types are
        // genuinely reachable from the published surface: `logic.document` is a
        // `SohlItem`, and the `sohl` global is typed by `SohlSystem`, whose
        // namespace tree exposes `sohl.document.*.foundry.*` outright — which is
        // what the consumer smoke test annotates against.
        //
        // Curation is the *entry file*'s job (`packages/sohl-types/generate/
        // entry.ts` plus rollup-plugin-dts tree-shaking), not this flag's.
        const cfg = readJsonc("tsconfig.sohl-types.json");
        expect(cfg.compilerOptions.stripInternal).toBeUndefined();
    });

    it("declares every third-party module the generated types import", () => {
        // The rollup config leaves declared peers external, so each one becomes
        // a bare `import … from "<module>"` in the published `index.d.ts`. A
        // consumer only resolves those if the package declares them; inside this
        // repository they resolve from the root `node_modules` either way, which
        // is precisely why the gap is invisible here. Keeping the rollup
        // `external` set derived from `peerDependencies` makes the declaration
        // the single source of truth.
        const pkg = readJson("packages/sohl-types/package.json");
        const rollup = fs.readFileSync(
            path.join(ROOT, "packages/sohl-types/rollup.config.mjs"),
            "utf8",
        );
        expect(Object.keys(pkg.peerDependencies ?? {}).sort()).toEqual([
            "@codemirror/autocomplete",
            "fvtt-types",
        ]);
        expect(rollup).toContain("peerDependencies");
    });

    it("is gated by the build, not only by the release workflow", () => {
        // The root cause of #1613 was reach, not the error itself: nothing ever
        // ran this path. `release.yml` publishes the package with
        // `continue-on-error: true` (deliberately — Foundry installs from the
        // Release's `system.zip`), so a failing `prepack` just stops publishing.
        const pkg = readJson("package.json");
        expect(pkg.scripts["build:noci"]).toContain("check:sohl-types");
        expect(pkg.scripts["check:sohl-types"]).toContain("utils/check-sohl-types.mjs");
    });
});
