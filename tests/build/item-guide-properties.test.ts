/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Every item kind's user-guide page mentions every field its DataModel
 * declares.
 *
 * The DataModel classes cannot be imported here: constructing one requires a
 * live Foundry `parent` document, and several reach `foundry.data.fields` at
 * module load, which does not exist outside a running Foundry client. So this
 * guard reads each kind's own schema fields from the TypeScript AST instead
 * of importing the class — the same approach `actor-guide-tabs.test.ts` uses
 * for `static TABS` — by reading the `return { ...Parent.defineSchema(),
 * field: new XField(...), ... }` object literal a `defineXSchema()` function
 * returns, and keeping only the fields declared directly in it. A spread of
 * the parent's own `defineSchema()` is not a `PropertyAssignment`, so a
 * field the kind merely inherits is never counted as its own — the same
 * fields appear once, on the base page that documents them
 * (`Item_Base.md` or `Item_Gear.md`), and are not repeated on every subtype's
 * page.
 *
 * It only proves every own field is *mentioned somewhere on the kind's
 * page* — in an "Additional Properties" bullet, a table row, a "Known gap"
 * callout for a field with no sheet control, or prose explaining where a
 * fixed-at-creation value is shown. It says nothing about whether what is
 * said about a field is true — that is checked by hand against the
 * DataModel and the matching `templates/item/*-properties.hbs` part.
 *
 * A field is matched two ways, either of which satisfies it:
 *
 * 1. Its resolved **label** — the string a reader actually sees, from
 *    `lang/en.json` via the kind's own `LOCALIZATION_PREFIXES` (the same
 *    prefix order Foundry's own schema localization tries) — appears
 *    (diacritics and punctuation folded away) anywhere on the page.
 * 2. Its **field name**, humanized and with a trailing `Base` dropped (the
 *    sheet label almost always drops it too — `durabilityBase` reads
 *    "Durability", not "Durability Base"), appears the same way.
 *
 * The second catches a field with no `FIELDS.<name>.label` key at all —
 * several nested group fields (`locations`, `impactBase`, `charges`) carry
 * only a `Heading` key or none, and are instead named by their own
 * sub-fields' labels or by the group's own key.
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

interface ItemKindUnderTest {
    kind: string;
    modelPath: string;
    guidePath: string;
    /**
     * `LOCALIZATION_PREFIXES` for a model that declares none of its own
     * (the two abstract bases, left to every concrete subclass to supply).
     */
    fallbackPrefixes?: string[];
}

const KINDS: ItemKindUnderTest[] = [
    {
        kind: "SohlItem (base)",
        modelPath: "src/document/item/foundry/SohlItemDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Base.md",
        fallbackPrefixes: ["SOHL.Item"],
    },
    {
        kind: "Gear (base)",
        modelPath: "src/document/item/foundry/GearDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Gear.md",
        fallbackPrefixes: ["SOHL.Gear", "SOHL.Item"],
    },
    {
        kind: "Affiliation",
        modelPath: "src/document/item/foundry/AffiliationDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Affiliation.md",
    },
    {
        kind: "Affliction",
        modelPath: "src/document/item/foundry/AfflictionDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Affliction.md",
    },
    {
        kind: "ArmorGear",
        modelPath: "src/document/item/foundry/ArmorGearDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Armorgear.md",
    },
    {
        kind: "Attribute",
        modelPath: "src/document/item/foundry/AttributeDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Attribute.md",
    },
    {
        kind: "ConcoctionGear",
        modelPath: "src/document/item/foundry/ConcoctionGearDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Concoctiongear.md",
    },
    {
        kind: "ContainerGear",
        modelPath: "src/document/item/foundry/ContainerGearDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Containergear.md",
    },
    {
        kind: "MiscGear",
        modelPath: "src/document/item/foundry/MiscGearDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Miscgear.md",
    },
    {
        kind: "Mystery",
        modelPath: "src/document/item/foundry/MysteryDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Mystery.md",
    },
    {
        kind: "MysticalAbility",
        modelPath: "src/document/item/foundry/MysticalAbilityDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_MysticalAbility.md",
    },
    {
        kind: "ProjectileGear",
        modelPath: "src/document/item/foundry/ProjectileGearDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Projectilegear.md",
    },
    {
        kind: "Skill",
        modelPath: "src/document/item/foundry/SkillDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Skill.md",
    },
    {
        kind: "Trauma",
        modelPath: "src/document/item/foundry/TraumaDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Trauma.md",
    },
    {
        kind: "WeaponGear",
        modelPath: "src/document/item/foundry/WeaponGearDataModel.ts",
        guidePath: "assets/content/User_Guide/Items/Item_Weapongear.md",
    },
];

/**
 * A documented, deliberate departure from a field's `lang/en.json` label or
 * its own humanized name — a word the guide uses instead, verified by hand
 * against the page. `docHtml` is edited through a custom link/rich-text
 * toggle with no generic form-group label of its own (see
 * `SohlItemSheetBase.ts`'s description-editing flow), and `Item_Base.md`
 * names it "Documentation" throughout rather than its `lang/en.json`
 * `"Description"` label.
 */
const LABEL_ALIASES: Record<string, string[]> = {
    docHtml: ["documentation"],
    // No `FIELDS.bloodLossAdvanceDurationFormula` key exists (it is seeded
    // from a world setting, never authored on an item) and the field has no
    // Properties-tab control of its own; the guide names it as the formula
    // behind the Blood-Loss Interval rather than under its own label.
    bloodLossAdvanceDurationFormula: ["blood-loss interval has a formula"],
};

/** One field declared directly in a `defineXSchema()` function's own object literal. */
function ownSchemaFields(modelPath: string): string[] {
    const absolute = path.join(ROOT, modelPath);
    const text = fs.readFileSync(absolute, "utf8");
    const sourceFile = ts.createSourceFile(absolute, text, ts.ScriptTarget.Latest, true);

    const fields: string[] = [];
    let found = false;

    function visit(node: ts.Node): void {
        if (
            ts.isFunctionDeclaration(node) &&
            node.name?.text.match(/^define\w*Schema$/) &&
            node.body
        ) {
            found = true;
            for (const statement of node.body.statements) {
                if (
                    !ts.isReturnStatement(statement) ||
                    !statement.expression ||
                    !ts.isObjectLiteralExpression(statement.expression)
                ) {
                    continue;
                }
                for (const prop of statement.expression.properties) {
                    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                        fields.push(prop.name.text);
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // A model with no fields of its own (e.g. MiscGear, which adds nothing
    // beyond Gear) is valid and yields an empty list; only a genuinely
    // missing `define*Schema()` function is an error.
    if (!found) {
        throw new Error(`${modelPath}: no define*Schema() function found`);
    }

    return fields;
}

/** A class's own `static override readonly LOCALIZATION_PREFIXES = [...]`, if declared. */
function declaredPrefixes(modelPath: string): string[] | undefined {
    const absolute = path.join(ROOT, modelPath);
    const text = fs.readFileSync(absolute, "utf8");
    const sourceFile = ts.createSourceFile(absolute, text, ts.ScriptTarget.Latest, true);

    let prefixes: string[] | undefined;

    function visit(node: ts.Node): void {
        if (
            ts.isPropertyDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === "LOCALIZATION_PREFIXES" &&
            node.initializer &&
            ts.isArrayLiteralExpression(node.initializer)
        ) {
            prefixes = node.initializer.elements
                .filter(ts.isStringLiteral)
                .map((element) => element.text);
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return prefixes;
}

/**
 * A field's resolved label, trying each prefix in order, or `undefined` if
 * none resolves. A trailing parenthetical — `"Heal Test Interval (formula)"`
 * next to that field's own `"... (seconds)"` sibling — distinguishes two
 * labels that would otherwise collide, but the guide prose names the pair
 * once and is not expected to repeat the qualifier, so it is dropped here.
 */
function resolveLabel(field: string, prefixes: string[]): string | undefined {
    for (const prefix of prefixes) {
        const label = LANG[`${prefix}.FIELDS.${field}.label`];
        if (label) return label.replace(/\s*\([^)]*\)\s*$/, "");
    }
    return undefined;
}

/** A camelCase field name split into words, e.g. `masteryLevelBase` -> `mastery Level Base`. */
function humanize(field: string): string {
    return field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

/** Lowercased, diacritic- and punctuation-free, for a tolerant substring match. */
function normalize(text: string): string {
    return text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

/** The candidate match strings for one field: its resolved label(s) and its humanized name. */
function candidates(field: string, prefixes: string[]): string[] {
    const out: string[] = [...(LABEL_ALIASES[field] ?? [])];
    const label = resolveLabel(field, prefixes);
    if (label) out.push(label);
    out.push(humanize(field).replace(/ (Base|Ids?|Codes?|Uuid)$/, ""));
    return out;
}

describe("every item kind's user guide mentions every field its DataModel declares", () => {
    it.each(KINDS)("$kind", ({ modelPath, guidePath, fallbackPrefixes }) => {
        const fields = ownSchemaFields(modelPath);
        const prefixes = declaredPrefixes(modelPath) ?? fallbackPrefixes ?? [];
        const pageText = normalize(fs.readFileSync(path.join(ROOT, guidePath), "utf8"));

        const missing = fields.filter(
            (field) => !candidates(field, prefixes).some((c) => pageText.includes(normalize(c))),
        );

        expect(
            { fields, missing },
            `${guidePath}: no mention of ${JSON.stringify(missing)} (DataModel fields: ${JSON.stringify(fields)})`,
        ).toMatchObject({ missing: [] });
    });
});
