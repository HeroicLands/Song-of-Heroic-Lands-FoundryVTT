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
import { describe, expect, it } from "vitest";
import { positionOfFrontmatterPath } from "@heroiclands/package-build/engine/diagnostics";
import { readField } from "@heroiclands/package-build/engine/field-spec";
import { ITEM_BUILDERS as stockBuilders } from "@heroiclands/package-build/sohl/item-builders";
import { ITEM_BUILDERS } from "../../utils/item-builders.mjs";

const builders = ITEM_BUILDERS as typeof stockBuilders;
const keys = ["onsetDurationFormula", "healingCheckDurationFormula", "resolutionDurationFormula"];
const fieldFor = (key: string) =>
    builders.affliction.fields.find((field: any) => field.to === key)! as Parameters<
        typeof readField
    >[0];
const read = (key: string, fm: object) => readField(fieldFor(key), fm);

function failure(key: string, fm: object): Error & { keyPath?: string[] } {
    try {
        read(key, fm);
    } catch (error) {
        return error as Error & { keyPath?: string[] };
    }
    throw new Error("Expected invalid authored duration to be rejected");
}

describe("Affliction authored duration build validation", () => {
    it.each(keys)(
        "accepts arithmetic dice formulas, seconds, and explicit empty values for %s",
        (key) => {
            for (const formula of [
                "(2d6+3)*86400",
                "2d6*60",
                "2d6+3*3600",
                "(2d6+3)*3600",
                "120",
                "0",
                "",
                null,
            ]) {
                expect(read(key, { data: { [key]: formula } })).toBe(
                    formula === "" ? null : formula,
                );
            }
            expect(read(key, { data: { [key]: 120 } })).toBe("120");
            expect(read(key, {})).toBeNull();
        },
    );
    it.each(keys)("rejects malformed or impossible %s with the direct source key", (key) => {
        for (const formula of ["2d6*", "(2d6+3", "1d0", "-1", "(1d6+3)*-60", "Infinity"]) {
            const error = failure(key, { data: { [key]: formula } });
            expect(error.message).toContain(key);
            expect(error.message).toContain(formula);
            expect(error.keyPath).toEqual(["data", key]);
        }
    });
    it("validates the canonical nested value before a malformed shared value", () => {
        const key = keys[0];
        expect(
            read(key, { data: { [key]: "2d6*" }, sohl: { system: { [key]: "(2d6+3)*60" } } }),
        ).toBe("(2d6+3)*60");
        const error = failure(key, { data: { [key]: "60" }, sohl: { system: { [key]: "2d6*" } } });
        expect(error.keyPath).toEqual(["sohl", "system", key]);
        expect(
            read(key, { data: { [key]: "2d6*" }, sohl: { system: { [key]: null } } }),
        ).toBeNull();
    });
    it("locates invalid nested formulas at the compiler's authored source line", () => {
        const key = keys[0];
        const note = "---\nname: Test\nsohl:\n  system:\n    onsetDurationFormula: 2d6*\n---\n";
        const error = failure(key, { sohl: { system: { [key]: "2d6*" } } });
        expect(positionOfFrontmatterPath(note, error.keyPath!)).toMatchObject({ line: 5 });
    });
    it("handles normal precedence and signed arithmetic by possible duration totals", () => {
        const key = keys[0];
        for (const formula of [
            "(-3)*-60",
            "(1d6-10)*-60",
            "1d6*0",
            "1d6-3",
            "(1-2)*-3",
            "8/2",
            "1d6/2",
            "2d6+3*3600",
            "(2d6+3)*3600",
        ]) {
            expect(read(key, { data: { [key]: formula } })).toBe(formula);
        }
        expect(() => read(key, { data: { [key]: "(2d6+3)*9007199254740991" } })).toThrow();
    });
    it("leaves Trauma and every unrelated stock builder and field untouched", () => {
        for (const [type, row] of Object.entries(stockBuilders)) {
            if (type !== "affliction") expect(builders[type]).toBe(row);
        }
        for (const field of stockBuilders.affliction.fields as Array<{ to: string }>) {
            if (!keys.includes(field.to)) expect(fieldFor(field.to)).toBe(field);
        }
        expect(ITEM_BUILDERS.affliction.img).toBe(stockBuilders.affliction.img);
        expect(
            (
                builders.affliction.system({
                    subType: "disease",
                    data: { onsetDurationFormula: "2d6*60" },
                }) as Record<string, unknown>
            ).onsetDurationFormula,
        ).toBe("2d6*60");
        expect(() =>
            builders.affliction.system({
                subType: "disease",
                data: { onsetDurationFormula: "2d6*" },
            }),
        ).toThrow();
    });
});
