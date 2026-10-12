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
import { readFileSync } from "node:fs";
import { intrinsicActionIconPairs } from "../../utils/build-icon-legend.mjs";

describe("intrinsic action icon extraction", () => {
    it("keeps the real treatment title with its own staff icon after mapped Grab actions", () => {
        const pairs = intrinsicActionIconPairs(
            readFileSync("src/document/actor/logic/BeingLogic.ts", "utf8"),
        );
        const treatment = pairs.filter((pair) => pair.title.includes("performTreatmentTest"));
        expect(treatment).toEqual([
            { title: "SOHL.Being.Action.performTreatmentTest", icon: "fa-solid fa-staff-snake" },
        ]);
    });
    it("never takes a dynamic map's icon or a nested object's title for an adjacent action", () => {
        const pairs = intrinsicActionIconPairs(`class Probe {
            static defineIntrinsicActions() { return [
                ...Object.entries({ answer: "choose" }).map(([code]) => ({
                    title: code, iconFAClass: "fa-solid fa-hand", visible: "false"
                })),
                { title: "treatment", nested: { iconFAClass: "wrong" },
                  iconFAClass: "fa-solid fa-staff-snake" },
                { title: "only-title" }, { iconFAClass: "only-icon" }
            ]; }
            unrelated() { return { title: "outside", iconFAClass: "outside-icon" }; }
        }`);
        expect(pairs).toEqual([{ title: "treatment", icon: "fa-solid fa-staff-snake" }]);
    });
});
