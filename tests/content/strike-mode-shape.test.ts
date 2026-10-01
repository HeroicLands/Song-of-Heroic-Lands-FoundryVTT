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
 * Every key a note authors inside a strike mode is a key the schema declares.
 *
 * The strike-mode list is emitted **verbatim** by the pack pipeline — it
 * validates only that each element carries a unique `shortcode` — so the one
 * statement of a strike mode's shape is the DataModel schema the document is
 * validated against: `MeleeStrikeMode.schemaFields()` and
 * `MissileStrikeMode.schemaFields()`. Foundry drops a key a `SchemaField` does
 * not declare, so an authored key spelled any other way reaches no document and
 * no reader, silently.
 *
 * The allowed key set is therefore **derived from those schemas at runtime**,
 * never copied here: adding a field to a strike mode admits it to the content
 * automatically, and renaming one fails every note still spelling it the old
 * way.
 *
 * `traits` is an `ObjectField`, which declares no keys and keeps whatever a note
 * writes, so the walk stops there rather than inventing a key list for it.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";
import { brandLogic } from "@tests/mocks/brandLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import { STRIKE_MODE_TYPE } from "@src/utils/constants";

const CONTENT = path.resolve(__dirname, "../../assets/content");

/** Every `.md` note under `assets/content/`, as repository-relative paths. */
function notes(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return notes(full);
        return entry.isFile() && entry.name.endsWith(".md") ? [full] : [];
    });
}

/** A note's parsed frontmatter, or `undefined` when it carries none. */
function frontmatter(file: string): any {
    const text = readFileSync(file, "utf8");
    if (!text.startsWith("---")) return undefined;
    const close = text.indexOf("\n---", 3);
    if (close < 0) return undefined;
    try {
        return parseYaml(text.slice(3, close + 1));
    } catch {
        return undefined;
    }
}

/**
 * The schema fields for a strike mode of the given `type`, keyed by field name.
 * Read from the classes that build the document, so this is the live
 * declaration rather than a description of it.
 */
function schemaFor(type: unknown): Record<string, unknown> {
    return type === STRIKE_MODE_TYPE.MISSILE ?
            (MissileStrikeMode.schemaFields() as Record<string, unknown>)
        :   (MeleeStrikeMode.schemaFields() as Record<string, unknown>);
}

/**
 * Report every authored key the schema does not declare, walking a `SchemaField`
 * (which carries a `fields` map) into its sub-fields and stopping at any other
 * field type — an `ObjectField` keeps whatever it is given.
 */
function undeclaredKeys(
    authored: unknown,
    fields: Record<string, unknown>,
    trail: string,
): string[] {
    if (!authored || typeof authored !== "object" || Array.isArray(authored)) return [];
    const out: string[] = [];
    for (const [key, value] of Object.entries(authored as Record<string, unknown>)) {
        const field = fields[key] as { fields?: Record<string, unknown> } | undefined;
        if (!field) {
            out.push(`${trail}.${key}`);
            continue;
        }
        if (field.fields) out.push(...undeclaredKeys(value, field.fields, `${trail}.${key}`));
    }
    return out;
}

/** One authored strike mode, with where it came from. */
interface AuthoredMode {
    /** The note's path, relative to the repository root. */
    file: string;
    /** Where in the frontmatter the mode sits, for the failure message. */
    trail: string;
    /** The authored mode object. */
    mode: Record<string, unknown>;
}

/**
 * Every strike mode authored anywhere in the content tree: a weapon's
 * `strikeModes` list, a combat technique's single `strikeMode`, and either of
 * those on a being note's inline `items` entries.
 */
function authoredModes(): AuthoredMode[] {
    const out: AuthoredMode[] = [];
    const push = (file: string, trail: string, value: unknown): void => {
        if (Array.isArray(value)) {
            value.forEach((mode, index) => {
                if (mode && typeof mode === "object") {
                    out.push({ file, trail: `${trail}[${index}]`, mode });
                }
            });
        } else if (value && typeof value === "object") {
            out.push({ file, trail, mode: value as Record<string, unknown> });
        }
    };

    for (const absolute of notes(CONTENT)) {
        const file = path.relative(path.resolve(__dirname, "../.."), absolute);
        const fm = frontmatter(absolute);
        const sohl = fm?.sohl;
        if (!sohl || typeof sohl !== "object") continue;
        push(file, "sohl.strikeMode", sohl.strikeMode);
        push(file, "sohl.system.strikeModes", sohl.system?.strikeModes);
        const items = Array.isArray(sohl.items) ? sohl.items : [];
        items.forEach((entry: any, index: number) => {
            if (!entry || typeof entry !== "object") return;
            push(file, `sohl.items[${index}].system.strikeMode`, entry.system?.strikeMode);
            push(file, `sohl.items[${index}].system.strikeModes`, entry.system?.strikeModes);
        });
    }
    return out;
}

const MODES = authoredModes();

/** A parent logic standing in for the weapon that owns a strike mode. */
const OWNER = brandLogic({
    actor: null,
    data: { kind: "weapongear" },
    name: "Authored Weapon",
    label: "Authored Weapon",
    speaker: {},
}) as any;

describe("authored strike modes match the schema that validates them", () => {
    it("finds the strike modes it is guarding", () => {
        // A walk that found nothing would make the case below vacuously pass.
        expect(MODES.length).toBeGreaterThan(100);
    });

    it("every melee mode declares a defence the schema reads", () => {
        // The narrow case, stated separately so a defence spelled some other way
        // names itself rather than arriving in a list of everything.
        const offenders = MODES.flatMap(({ file, trail, mode }) =>
            mode.type === STRIKE_MODE_TYPE.MISSILE ?
                []
            :   undeclaredKeys(
                    mode.defense,
                    (schemaFor(mode.type).defense as { fields: Record<string, unknown> }).fields,
                    `${file}: ${trail}.defense`,
                ),
        );
        expect(offenders).toEqual([]);
    });

    it("authors no strike-mode key the schema does not declare", () => {
        const offenders = MODES.flatMap(({ file, trail, mode }) =>
            undeclaredKeys(mode, schemaFor(mode.type), `${file}: ${trail}`),
        );
        expect(offenders).toEqual([]);
    });
});

describe("an authored defence modifier reaches the strike mode", () => {
    /** Every melee mode whose authored block or counterstrike modifier is non-zero. */
    const withModifier = MODES.filter(({ mode }) => {
        const defense = mode.defense as
            { block?: { modifier?: number }; counterstrike?: { modifier?: number } } | undefined;
        return !!(defense?.block?.modifier || defense?.counterstrike?.modifier);
    });

    it("finds authored modifiers to check", () => {
        // Content that declares no modifier anywhere would make the case below
        // vacuously pass, which is the state this guard exists to refuse.
        expect(withModifier.length).toBeGreaterThan(0);
    });

    it.each(withModifier.map((m) => [`${m.file}: ${m.trail}`, m] as const))(
        "%s",
        (_label, { mode }) => {
            const defense = mode.defense as {
                block?: { modifier?: number };
                counterstrike?: { modifier?: number };
            };
            const sm = new MeleeStrikeMode(
                mode as unknown as MeleeStrikeMode.Data,
                OWNER,
                String(mode.shortcode ?? ""),
            );
            // The authored number arrives as a named delta, so the breakdown on
            // the sheet and the card says where the value came from.
            expect(sm.defense.block.get("BlkMod")?.numValue ?? 0).toBe(
                defense.block?.modifier ?? 0,
            );
            expect(sm.defense.counterstrike.get("CtrMod")?.numValue ?? 0).toBe(
                defense.counterstrike?.modifier ?? 0,
            );
        },
    );
});
