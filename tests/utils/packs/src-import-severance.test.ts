/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// The two seams the pack pipeline used to reach into `src/` for. They now live
// in the shared build package, which is where the pipeline is headed (#1501),
// and the runtime imports the same modules from there (#1510).
import { DEFAULT_ITEM_ART } from "@heroiclands/content-build/sohl/default-item-art";
import { AFFILIATION_STANDINGS } from "@heroiclands/content-build/sohl/affiliation-standings";
// The runtime enum the shared standings list mirrors.
import { AffiliationStandings } from "@src/utils/constants";

const PACKS_DIR = path.resolve(__dirname, "../../../utils/packs");

/** Every `.mjs` under `utils/packs/`, recursively. */
function packModules(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return packModules(full);
        return entry.isFile() && entry.name.endsWith(".mjs") ? [full] : [];
    });
}

/** The specifier of every static/dynamic import and re-export in a module. */
function importSpecifiers(source: string): string[] {
    const out: string[] = [];
    const re = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(source)) !== null) out.push(match[1]!);
    return out;
}

describe("pack pipeline severance from src/ (#1510)", () => {
    it("no pack module imports anything out of src/", () => {
        const offenders: string[] = [];
        for (const file of packModules(PACKS_DIR)) {
            for (const spec of importSpecifiers(
                fs.readFileSync(file, "utf8"),
            )) {
                // A relative specifier that climbs out of `utils/` and into
                // `src/` resolves to garbage once this code is installed into
                // `node_modules` as `@heroiclands/content-build`.
                if (/(^|\/)src\//.test(spec)) {
                    offenders.push(
                        `${path.relative(PACKS_DIR, file)} → ${spec}`,
                    );
                }
            }
        }
        expect(offenders).toEqual([]);
    });

    it("shares the default-art map with the runtime from the build package", () => {
        expect(DEFAULT_ITEM_ART.weapongear).toBe(
            "systems/sohl/assets/icons/other/sword.svg",
        );
    });

    it("keeps the shared standings list identical to the runtime enum", () => {
        // The pack pipeline validates an authored `relation` map against this
        // list; the runtime validates the same values through
        // `AFFILIATION_STANDING`. One diverging from the other is exactly the
        // #932-shaped drift this arrangement exists to prevent.
        expect([...AFFILIATION_STANDINGS].sort()).toEqual(
            [...AffiliationStandings].sort(),
        );
    });
});
