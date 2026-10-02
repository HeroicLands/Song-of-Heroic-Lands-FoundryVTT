/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Every actor kind's user-guide page names every tab its sheet declares.
 *
 * The sheet classes cannot be imported here: constructing
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
 * not declare. It compares against the tab's **label** — the string
 * `lang/en.json` gives its `label` key, the word a reader actually sees on
 * the tab strip — not its internal id, so the `trauma` id (labelled
 * **Health**) is checked against "Health", not against "Trauma". It says
 * nothing about whether a tab's description is true — that is checked by
 * hand against the part template each tab renders.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(__dirname, "../..");

/** `lang/en.json`, keyed flat by its dotted localization keys. */
const LANG: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(ROOT, "lang/en.json"), "utf8"),
);

interface SheetUnderTest {
    actorKind: string;
    sheetPath: string;
    guidePath: string;
}

const SHEETS: SheetUnderTest[] = [
    {
        actorKind: "Being",
        sheetPath: "src/document/actor/foundry/BeingSheet.ts",
        guidePath: "assets/content/User_Guide/Actors/Actor_Being.md",
    },
    {
        actorKind: "Cohort",
        sheetPath: "src/document/actor/foundry/CohortSheet.ts",
        guidePath: "assets/content/User_Guide/Actors/Actor_Cohort.md",
    },
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

/** One tab, as a sheet's `static TABS` declares it. */
interface DeclaredTab {
    id: string;
    labelKey: string;
}

/**
 * The tabs a sheet class declares, in declaration order, read from the
 * `static override TABS` object literal's `<group>.tabs[]` entries.
 *
 * @param sheetPath - The sheet source file, relative to the repository root.
 * @returns The declared tabs, in the order the sheet lists them.
 */
function declaredTabs(sheetPath: string): DeclaredTab[] {
    const absolute = path.join(ROOT, sheetPath);
    const text = fs.readFileSync(absolute, "utf8");
    const sourceFile = ts.createSourceFile(absolute, text, ts.ScriptTarget.Latest, true);

    const tabs: DeclaredTab[] = [];

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
                        let id: string | undefined;
                        let labelKey: string | undefined;
                        for (const tabField of tabEntry.properties) {
                            if (
                                !ts.isPropertyAssignment(tabField) ||
                                !ts.isIdentifier(tabField.name) ||
                                !ts.isStringLiteral(tabField.initializer)
                            ) {
                                continue;
                            }
                            if (tabField.name.text === "id") id = tabField.initializer.text;
                            if (tabField.name.text === "label")
                                labelKey = tabField.initializer.text;
                        }
                        if (id && labelKey) tabs.push({ id, labelKey });
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    if (!tabs.length) {
        throw new Error(`${sheetPath}: no static TABS declaration found`);
    }

    return tabs;
}

/**
 * A declared tab's display label — the string a reader sees on the tab
 * strip — resolved from `lang/en.json` rather than the tab's internal id.
 *
 * @param tab - The declared tab.
 * @returns The label text.
 */
function tabLabel(tab: DeclaredTab): string {
    const label = LANG[tab.labelKey];
    if (!label) {
        throw new Error(`${tab.labelKey}: no such key in lang/en.json (tab id "${tab.id}")`);
    }
    return label;
}

/**
 * The tab names a guide page documents, read from the bolded bullet list
 * under the sentence introducing "The <Kind> Sheet" section's tab list —
 * worded "has these tabs:" on three pages and "is organized into several
 * tabs:" on Being's, so the match is on the common tail, not the lead-in.
 *
 * @param guidePath - The guide page, relative to the repository root.
 * @returns The documented tab names, in the order the guide lists them.
 */
function documentedTabs(guidePath: string): string[] {
    const absolute = path.join(ROOT, guidePath);
    const text = fs.readFileSync(absolute, "utf8");
    const list = text.match(/ tabs:\n\n((?:- .+\n)+)/);
    if (!list) {
        throw new Error(`${guidePath}: no tab-introducing bullet list found`);
    }

    const names: string[] = [];
    for (const line of list[1].split("\n")) {
        const bullet = line.match(/^- \*\*(.+?)\*\*/);
        if (bullet) names.push(bullet[1]);
    }
    return names;
}

/**
 * A tab label normalized for comparison: diacritics dropped, lowercased,
 * non-letters dropped — so the **Façade** label agrees with a guide's plain
 * "Facade", and a sheet's "Shared Gear" agrees with a guide's "Shared Gear"
 * however the two space or punctuate it.
 *
 * @param label - A tab's resolved label or a guide's bolded tab name.
 * @returns The normalized form.
 */
function normalize(label: string): string {
    return label
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z]/g, "");
}

describe("every actor kind's user guide names every tab its sheet declares", () => {
    it.each(SHEETS)("$actorKind", ({ actorKind, sheetPath, guidePath }) => {
        const declared = declaredTabs(sheetPath).map(tabLabel);
        const documented = documentedTabs(guidePath);

        const declaredNormalized = declared.map(normalize);
        const documentedNormalized = documented.map(normalize);

        const missing = declared.filter(
            (label) => !documentedNormalized.includes(normalize(label)),
        );
        const extra = documented.filter((name) => !declaredNormalized.includes(normalize(name)));

        expect(
            { actorKind, declared, documented, missing, extra },
            `${actorKind}: the sheet declares ${JSON.stringify(declared)}; the guide names ${JSON.stringify(documented)}`,
        ).toMatchObject({ missing: [], extra: [] });
    });
});
