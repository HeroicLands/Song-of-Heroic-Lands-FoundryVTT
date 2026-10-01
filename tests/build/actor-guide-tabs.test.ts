/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The Structure and Vehicle user-guide pages name every tab their sheet
 * declares.
 *
 * `StructureSheet` and `VehicleSheet` cannot be imported here: constructing
 * their base class evaluates `foundry.applications.api.DocumentSheetV2` and
 * `HandlebarsApplicationMixin` at module load, and neither exists outside a
 * running Foundry client. So this guard reads the declared tab ids from the
 * TypeScript AST instead of importing the class, the way
 * `lang-references.test.ts` reads `defineType` calls without executing the
 * module that makes them — a parse of the real source, not a hand-copied
 * second list for the sheet or the guide to drift against.
 *
 * It only proves every tab is *named*, in both directions: a tab the sheet
 * declares and the guide omits, and a tab the guide names that the sheet does
 * not declare. It says nothing about whether a tab's description is true —
 * that is checked by hand against the part template each tab renders.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(__dirname, "../..");

interface SheetUnderTest {
    actorKind: string;
    sheetPath: string;
    guidePath: string;
}

const SHEETS: SheetUnderTest[] = [
    {
        actorKind: "Structure",
        sheetPath: "src/document/actor/foundry/StructureSheet.ts",
        guidePath: "assets/content/User_Guide/Actors/Actor_Structure.md",
    },
    {
        actorKind: "Vehicle",
        sheetPath: "src/document/actor/foundry/VehicleSheet.ts",
        guidePath: "assets/content/User_Guide/Actors/Actor_Vehicle.md",
    },
];

/**
 * The tab ids a sheet class declares, in declaration order, read from the
 * `static override TABS` object literal's `<group>.tabs[].id` entries.
 *
 * @param sheetPath - The sheet source file, relative to the repository root.
 * @returns The declared tab ids, in the order the sheet lists them.
 */
function declaredTabs(sheetPath: string): string[] {
    const absolute = path.join(ROOT, sheetPath);
    const text = fs.readFileSync(absolute, "utf8");
    const sourceFile = ts.createSourceFile(absolute, text, ts.ScriptTarget.Latest, true);

    const ids: string[] = [];

    function visit(node: ts.Node): void {
        if (
            ts.isPropertyDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === "TABS" &&
            node.initializer &&
            ts.isObjectLiteralExpression(node.initializer)
        ) {
            for (const group of node.initializer.properties) {
                if (
                    !ts.isPropertyAssignment(group) ||
                    !ts.isObjectLiteralExpression(group.initializer)
                ) {
                    continue;
                }
                for (const groupField of group.initializer.properties) {
                    if (
                        !ts.isPropertyAssignment(groupField) ||
                        !ts.isIdentifier(groupField.name) ||
                        groupField.name.text !== "tabs" ||
                        !ts.isArrayLiteralExpression(groupField.initializer)
                    ) {
                        continue;
                    }
                    for (const tabEntry of groupField.initializer.elements) {
                        if (!ts.isObjectLiteralExpression(tabEntry)) continue;
                        for (const tabField of tabEntry.properties) {
                            if (
                                ts.isPropertyAssignment(tabField) &&
                                ts.isIdentifier(tabField.name) &&
                                tabField.name.text === "id" &&
                                ts.isStringLiteral(tabField.initializer)
                            ) {
                                ids.push(tabField.initializer.text);
                            }
                        }
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    if (!ids.length) {
        throw new Error(`${sheetPath}: no static TABS declaration found`);
    }

    return ids;
}

/**
 * The tab names a guide page documents, read from the bolded bullet list
 * under "The <Kind> Sheet has these tabs:".
 *
 * @param guidePath - The guide page, relative to the repository root.
 * @returns The documented tab names, in the order the guide lists them.
 */
function documentedTabs(guidePath: string): string[] {
    const absolute = path.join(ROOT, guidePath);
    const text = fs.readFileSync(absolute, "utf8");
    const list = text.match(/ sheet has these tabs:\n\n((?:- .+\n)+)/);
    if (!list) {
        throw new Error(`${guidePath}: no "sheet has these tabs:" bullet list found`);
    }

    const names: string[] = [];
    for (const line of list[1].split("\n")) {
        const bullet = line.match(/^- \*\*(.+?)\*\*/);
        if (bullet) names.push(bullet[1]);
    }
    return names;
}

/**
 * A tab identifier normalized for comparison: lowercased, non-letters
 * dropped, so a sheet's `sharedgear` agrees with a guide's "Shared Gear".
 *
 * @param name - A tab id or a guide's bolded tab name.
 * @returns The normalized form.
 */
function normalize(name: string): string {
    return name.toLowerCase().replace(/[^a-z]/g, "");
}

describe("Structure and Vehicle user guides name every tab their sheet declares", () => {
    it.each(SHEETS)("$actorKind", ({ actorKind, sheetPath, guidePath }) => {
        const declared = declaredTabs(sheetPath);
        const documented = documentedTabs(guidePath);

        const declaredNormalized = declared.map(normalize);
        const documentedNormalized = documented.map(normalize);

        const missing = declared.filter((id) => !documentedNormalized.includes(normalize(id)));
        const extra = documented.filter((name) => !declaredNormalized.includes(normalize(name)));

        expect(
            { actorKind, declared, documented, missing, extra },
            `${actorKind}: the sheet declares ${JSON.stringify(declared)}; the guide names ${JSON.stringify(documented)}`,
        ).toMatchObject({ missing: [], extra: [] });
    });
});
