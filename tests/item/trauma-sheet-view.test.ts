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
import { traumaSheetFields } from "@src/document/item/logic/trauma-sheet-view";
import { TRAUMA_SUBTYPE } from "@src/utils/constants";

describe("traumaSheetFields (#939)", () => {
    it("fatigue: level + category + notes only", () => {
        const f = traumaSheetFields(TRAUMA_SUBTYPE.FATIGUE);
        expect(f).toMatchObject({
            showLevel: true,
            showCategory: true,
            showNotes: true,
            showHealingRate: false,
            showTreatmentDate: false,
            showBodyLocation: false,
            showAspect: false,
            showBloodLoss: false,
            showHealDuration: false,
            showCourseDuration: false,
            showInjuryFlags: false,
        });
        expect(f.nextTestLabelKey).toBeUndefined();
    });

    it("fear / morale: category + notes, no level (#961)", () => {
        // Fear/Morale state lives in the `category` field (a per-subtype
        // dropdown), not a numeric level.
        for (const st of [TRAUMA_SUBTYPE.FEAR, TRAUMA_SUBTYPE.MORALE]) {
            const f = traumaSheetFields(st);
            expect(f.showCategory).toBe(true);
            expect(f.showNotes).toBe(true);
            expect(f.showLevel).toBe(false);
            expect(f.nextTestLabelKey).toBeUndefined();
        }
    });

    it("physcond: category + notes, no level", () => {
        const f = traumaSheetFields(TRAUMA_SUBTYPE.PHYSICAL_CONDITION);
        expect(f.showLevel).toBe(false);
        expect(f.showCategory).toBe(true);
        expect(f.showNotes).toBe(true);
        expect(f.nextTestLabelKey).toBeUndefined();
    });

    it("pall / auralshock: level + a next-test label, no category/notes", () => {
        expect(traumaSheetFields(TRAUMA_SUBTYPE.PALL)).toMatchObject({
            showLevel: true,
            showCategory: false,
            showNotes: false,
            nextTestLabelKey: "SOHL.Trauma.COLUMN.nextPall",
        });
        expect(traumaSheetFields(TRAUMA_SUBTYPE.AURALSHOCK)).toMatchObject({
            showLevel: true,
            nextTestLabelKey: "SOHL.Trauma.COLUMN.nextAural",
        });
    });

    it("psycond: level + category + next PSY test", () => {
        expect(traumaSheetFields(TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION)).toMatchObject({
            showLevel: true,
            showCategory: true,
            showNotes: false,
            nextTestLabelKey: "SOHL.Trauma.COLUMN.nextPsyche",
        });
    });

    it("infection: level, HR, body location, treatment + heal duration, next heal", () => {
        expect(traumaSheetFields(TRAUMA_SUBTYPE.INFECTION)).toMatchObject({
            showLevel: true,
            showHealingRate: true,
            showBodyLocation: true,
            showTreatmentDate: true,
            showHealDuration: true,
            showAspect: false,
            showBloodLoss: false,
            showInjuryFlags: false,
            showCourseDuration: false,
            nextTestLabelKey: "SOHL.Trauma.COLUMN.nextHeal",
        });
    });

    it("injury: everything infection has, plus aspect / blood loss / injury flags", () => {
        expect(traumaSheetFields(TRAUMA_SUBTYPE.INJURY)).toMatchObject({
            showLevel: true,
            showHealingRate: true,
            showBodyLocation: true,
            showTreatmentDate: true,
            showHealDuration: true,
            showAspect: true,
            showBloodLoss: true,
            showInjuryFlags: true,
            showCourseDuration: false,
            nextTestLabelKey: "SOHL.Trauma.COLUMN.nextHeal",
        });
    });

    it("shock / coma: HR + course duration + next course, no level", () => {
        for (const st of [TRAUMA_SUBTYPE.SHOCK, TRAUMA_SUBTYPE.COMA]) {
            expect(traumaSheetFields(st)).toMatchObject({
                showLevel: false,
                showHealingRate: true,
                showCourseDuration: true,
                showHealDuration: false,
                nextTestLabelKey: "SOHL.Trauma.COLUMN.nextCourse",
            });
        }
    });
});
