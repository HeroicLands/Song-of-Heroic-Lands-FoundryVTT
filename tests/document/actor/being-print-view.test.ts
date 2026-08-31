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
import {
    formatPrintHealthLine,
    summarizeActiveStatuses,
    summarizeInjuredParts,
    formatPrintChargesDisplay,
    formatPrintLevel,
    BODY_PART_STATUS_PRINT_LABEL,
    PRINT_EM_DASH,
} from "@src/document/actor/logic/being-print-view";
import type { StatusPill, BodyPartLozenge } from "@src/document/actor/logic/being-sheet-view";

const pill = (over: Partial<StatusPill> = {}): StatusPill => ({
    id: "stun",
    abbr: "STN",
    label: "SOHL.Being.StatusPill.stun.label",
    active: false,
    toggleable: true,
    ...over,
});

const loz = (over: Partial<BodyPartLozenge> = {}): BodyPartLozenge => ({
    shortcode: "RARM",
    name: "Right Arm",
    status: "none",
    ...over,
});

describe("being-print-view", () => {
    describe("formatPrintHealthLine", () => {
        it("joins a band label and percentage", () => {
            expect(formatPrintHealthLine("Wounded", 62)).toBe("Wounded · 62%");
        });

        it("drops the band when absent", () => {
            expect(formatPrintHealthLine("", 40)).toBe("40%");
            expect(formatPrintHealthLine(undefined, 100)).toBe("100%");
        });
    });

    describe("summarizeActiveStatuses", () => {
        const localize = (key: string) => key.split(".").at(-2) ?? key;

        it("localizes and joins only the active pills, in order", () => {
            const pills = [
                pill({ id: "fatigue", label: "x.fatigue.label", active: true }),
                pill({ id: "prone", label: "x.prone.label", active: false }),
                pill({ id: "stun", label: "x.stun.label", active: true }),
            ];
            expect(summarizeActiveStatuses(pills, localize)).toBe("fatigue, stun");
        });

        it("returns an empty string when nothing is active", () => {
            expect(summarizeActiveStatuses([pill(), pill()], localize)).toBe("");
        });
    });

    describe("summarizeInjuredParts", () => {
        const statusLabel = (s: keyof typeof BODY_PART_STATUS_PRINT_LABEL) =>
            BODY_PART_STATUS_PRINT_LABEL[s];

        it("lists injured parts with their status label, skipping healthy ones", () => {
            const lozenges: BodyPartLozenge[] = [
                loz({ name: "Skull", status: "none" }),
                loz({ name: "Right Arm", status: "minor" }),
                loz({ name: "Left Leg", status: "unusable" }),
            ];
            expect(summarizeInjuredParts(lozenges, statusLabel)).toBe(
                "Right Arm (minor), Left Leg (unusable)",
            );
        });

        it("returns an empty string when no part is injured", () => {
            expect(summarizeInjuredParts([loz(), loz({ name: "Head" })], statusLabel)).toBe("");
        });
    });

    describe("formatPrintChargesDisplay", () => {
        it("shows an em dash when max is disabled", () => {
            expect(
                formatPrintChargesDisplay({
                    valueDisabled: false,
                    maxDisabled: true,
                    value: 3,
                    max: 5,
                }),
            ).toBe(PRINT_EM_DASH);
        });

        it("shows infinity when value is disabled", () => {
            expect(
                formatPrintChargesDisplay({
                    valueDisabled: true,
                    maxDisabled: false,
                    value: 0,
                    max: 5,
                }),
            ).toBe("∞");
        });

        it("shows value/∞ when max is zero (unbounded)", () => {
            expect(
                formatPrintChargesDisplay({
                    valueDisabled: false,
                    maxDisabled: false,
                    value: 2,
                    max: 0,
                }),
            ).toBe("2/∞");
        });

        it("shows value/max otherwise", () => {
            expect(
                formatPrintChargesDisplay({
                    valueDisabled: false,
                    maxDisabled: false,
                    value: 2,
                    max: 5,
                }),
            ).toBe("2/5");
        });
    });

    describe("formatPrintLevel", () => {
        it("shows an em dash when disabled", () => {
            expect(formatPrintLevel(true, 4)).toBe(PRINT_EM_DASH);
            expect(formatPrintLevel(true, 4, { signed: true })).toBe(PRINT_EM_DASH);
        });

        it("renders a plain value by default", () => {
            expect(formatPrintLevel(false, 3)).toBe("3");
            expect(formatPrintLevel(false, 0)).toBe("0");
        });

        it("renders a signed value when requested", () => {
            expect(formatPrintLevel(false, 3, { signed: true })).toBe("+3");
            expect(formatPrintLevel(false, -2, { signed: true })).toBe("-2");
            expect(formatPrintLevel(false, 0, { signed: true })).toBe("+0");
        });
    });
});
