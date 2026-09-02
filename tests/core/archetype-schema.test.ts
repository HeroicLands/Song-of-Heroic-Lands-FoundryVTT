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
 * `system.archetype` (issue #1780) — the Create-dialog archetype marker, moved
 * off `flags.sohl.docArchetype` and into the schema so it can be authored on a
 * sheet instead of by export / hand-edit / re-import.
 *
 * Two different claims are asserted here.
 *
 * - **It is published on every subtype.** `schema.json` is what other
 *   repositories actually read — `@heroiclands/package-build`'s
 *   emitted-versus-declared check, and the satellite content trees that author
 *   the field. An undeclared `system` key is discarded silently at
 *   construction, so this has to be checked against the artifact rather than
 *   against the source it was generated from. `npm run lint:schema` separately
 *   guarantees the artifact is not stale, so asserting on it is not asserting
 *   on a stale copy.
 * - **It is declared once, with the right options.** `schema.json` records
 *   field _names_, not field options, so the `nullable` / `integer` /
 *   `initial: null` triple is asserted against the source of
 *   `defineSohlDataSchema()`. It is read as text rather than imported for the
 *   same reason `temporal-fields.test.ts` reads the artifact: importing the
 *   DataModel classes pulls in a circular Foundry-coupled chain (#481, #588).
 */
const ROOT = path.join(import.meta.dirname, "../..");
const artifact = JSON.parse(fs.readFileSync(path.join(ROOT, "schema.json"), "utf8"));
const sharedSchemaSource = fs.readFileSync(
    path.join(ROOT, "src/core/foundry/SohlDataModel.ts"),
    "utf8",
);

describe("system.archetype is declared once, on the shared base (#1780)", () => {
    it("declares a nullable integer NumberField initialized to null", () => {
        // The default must be the not-an-archetype state, and it must be `null`
        // rather than `0`: `0` is a real priority (SoHL's own archetypes ship at
        // it), so an `initial: 0` would make every new document an archetype.
        expect(sharedSchemaSource).toMatch(
            /archetype:\s*new NumberField\(\{\s*nullable:\s*true,\s*integer:\s*true,\s*initial:\s*null,?\s*\}\)/,
        );
    });

    it("declares it exactly once in the whole source tree", () => {
        // One declaration on the shared base is the point — seventeen copies,
        // one per subtype, would drift.
        const declarations = walkTs(path.join(ROOT, "src")).filter((file) =>
            /archetype:\s*new NumberField/.test(fs.readFileSync(file, "utf8")),
        );
        expect(declarations.map((f) => path.relative(ROOT, f))).toEqual([
            "src/core/foundry/SohlDataModel.ts",
        ]);
    });
});

describe("system.archetype is published on every Item and Actor subtype (#1780)", () => {
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

        it.each(subtypes)(`${documentType}.%s carries archetype`, (subtype) => {
            expect(fieldsOf(documentType, subtype)).toContain("archetype");
        });
    }

    it("carries it as inherited, not re-declared per subtype", () => {
        for (const documentType of ["Item", "Actor"]) {
            for (const [subtype, entry] of Object.entries<any>(
                artifact.documents?.[documentType] ?? {},
            )) {
                expect(entry.inherited, `${documentType}.${subtype}`).toContain("archetype");
                expect(entry.own, `${documentType}.${subtype}`).not.toContain("archetype");
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
