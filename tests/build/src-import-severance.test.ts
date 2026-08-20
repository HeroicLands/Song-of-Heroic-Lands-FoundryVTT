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
// The runtime rule that decides whether a description is a pointer, and the
// pack-side pieces that write one. The agreement between them is a
// repository-side fact, so it is asserted here rather than travelling with the
// pack tests into the package (#1511).
import { descriptionLinkTarget } from "@src/utils/description-link";
import {
    itemDocEntryId,
    itemDocPointer,
} from "@heroiclands/content-build/engine/item-docs";
import {
    splitPages,
    journalPageId,
} from "@heroiclands/content-build/engine/journals";

// The pipeline lives in its own repository now (#1589) and arrives here as an
// installed dependency, so the guard walks what npm actually delivered rather
// than a working copy. That is the stronger check: it asserts the severance of
// the *published tarball*, which is the only form any consumer ever sees, and
// it would catch a module that is clean in its own repository but ships broken.
const PACKS_DIR = path.resolve(
    __dirname,
    "../../node_modules/@heroiclands/content-build",
);

/** Every `.mjs` in the installed package, recursively. */
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
    it("finds the pipeline it is guarding", () => {
        // A walk that found nothing would make the case below vacuously pass.
        expect(packModules(PACKS_DIR).length).toBeGreaterThan(20);
    });

    it("no pack module imports anything out of src/", () => {
        const offenders: string[] = [];
        for (const file of packModules(PACKS_DIR)) {
            for (const spec of importSpecifiers(
                fs.readFileSync(file, "utf8"),
            )) {
                // A relative specifier that climbs out of the package and
                // into `src/` resolves to garbage once this code is installed
                // into `node_modules` as `@heroiclands/content-build`.
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

describe("the pack pipeline and the runtime agree on description pointers", () => {
    /** The pointer the items pass writes for a note, derived exactly as it does. */
    function pointerFor(
        itemId: string,
        name: string,
        markdown: string,
    ): string {
        const [lead] = splitPages(markdown, name);
        return itemDocPointer(
            "sohl",
            itemId,
            name,
            journalPageId(itemDocEntryId(itemId), lead, 0),
        );
    }

    it("is a pointer by the system's own rule", () => {
        // The round-trip that matters: what the pack writes is what
        // `descriptionLinkTarget` recognises at runtime (#1356).
        const pointer = pointerFor("xPisQgs7pKDaYaKs", "Dehydrated", "body");
        expect(descriptionLinkTarget(pointer)).toBe(
            pointer.slice("@UUID[".length, pointer.indexOf("]")),
        );
    });
});
