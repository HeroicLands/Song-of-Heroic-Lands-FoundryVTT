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

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * `system.isDraft` — the flag that records whether a document's content is
 * settled, so sheets and directories can mark an unfinished entry.
 *
 * Two different claims are asserted here.
 *
 * - **It is published on every subtype.** `schema.json` is what other
 *   repositories actually read, and an undeclared `system` key is discarded
 *   silently at construction, so this is checked against the artifact rather
 *   than against the source it was generated from. `npm run build:schema`
 *   generates `build/schema.json` fresh before this suite runs.
 * - **It is declared once, with the right options.** `schema.json` records
 *   field _names_, not field options, so the `initial: false` is asserted
 *   against the source of `defineSohlDataSchema()`. It is read as text rather
 *   than imported because importing the DataModel classes pulls in a circular
 *   Foundry-coupled chain.
 */
const ROOT = path.join(import.meta.dirname, "../..");
const artifact = JSON.parse(fs.readFileSync(path.join(ROOT, "build/schema.json"), "utf8"));
const sharedSchemaSource = fs.readFileSync(
    path.join(ROOT, "src/core/foundry/SohlDataModel.ts"),
    "utf8",
);

describe("system.isDraft is declared once, on the shared base", () => {
    it("declares a BooleanField initialized to false", () => {
        // `initial` is set explicitly, as every field on this schema does, and
        // the field is not nullable: "unset" and "not a draft" are the same
        // state, so `false` carries both and there is no third value a reader
        // could tell apart.
        expect(sharedSchemaSource).toMatch(
            /isDraft:\s*new BooleanField\(\{\s*initial:\s*false,?\s*\}\)/,
        );
    });

    it("is not nullable", () => {
        const declaration = /isDraft:\s*new BooleanField\(\{[^}]*\}\)/.exec(sharedSchemaSource);
        expect(declaration).not.toBeNull();
        expect(declaration![0]).not.toMatch(/nullable/);
    });

    it("declares it exactly once in the whole source tree", () => {
        // One declaration on the shared base is the point — one copy per
        // subtype would drift.
        const declarations = walkTs(path.join(ROOT, "src")).filter((file) =>
            /isDraft:\s*new BooleanField/.test(fs.readFileSync(file, "utf8")),
        );
        expect(declarations.map((f) => path.relative(ROOT, f))).toEqual([
            "src/core/foundry/SohlDataModel.ts",
        ]);
    });
});

describe("system.isDraft is published on every Item and Actor subtype", () => {
    /** Every field path a subtype declares, own and inherited. */
    function fieldsOf(documentType: string, subtype: string): string[] {
        const entry = artifact.documents?.[documentType]?.[subtype];
        if (!entry) throw new Error(`${documentType}.${subtype} is not published`);
        return [...entry.own, ...entry.inherited];
    }

    for (const documentType of ["Item", "Actor"]) {
        const subtypes = Object.keys(artifact.documents?.[documentType] ?? {});

        it(`publishes at least one ${documentType} subtype`, () => {
            expect(subtypes.length).toBeGreaterThan(0);
        });

        it.each(subtypes)(`${documentType}.%s carries isDraft`, (subtype) => {
            expect(fieldsOf(documentType, subtype)).toContain("isDraft");
        });
    }

    it("carries it as inherited, not re-declared per subtype", () => {
        for (const documentType of ["Item", "Actor"]) {
            for (const [subtype, entry] of Object.entries<any>(
                artifact.documents?.[documentType] ?? {},
            )) {
                expect(entry.inherited, `${documentType}.${subtype}`).toContain("isDraft");
                expect(entry.own, `${documentType}.${subtype}`).not.toContain("isDraft");
            }
        }
    });
});

/**
 * Every `.ts` file under a directory, recursively.
 * @param dir - The directory to walk.
 * @returns Absolute paths of every TypeScript file found beneath it.
 */
function walkTs(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walkTs(full));
        else if (entry.name.endsWith(".ts")) out.push(full);
    }
    return out;
}
