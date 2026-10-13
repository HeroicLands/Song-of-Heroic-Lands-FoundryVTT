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

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { parse } from "yaml";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import {
    impactTacticalAdvantageValue,
    impactTacticalAdvantageBonus,
} from "@src/entity/strikemode/impactTacticalAdvantage";

const root = path.resolve(__dirname, "../../assets/content");
const rules = readFileSync(path.join(root, "Rules/Combat/Unarmed_Combat.md"), "utf8");
/** Read authored mode data; neither the compiler nor a built artifact is needed. */
function authoredMode(name: string): StrikeModeBase {
    const text = readFileSync(path.join(root, `Skills/Combat_Techniques/${name}.md`), "utf8");
    const close = text.indexOf("\n---\n", 4);
    const data = parse(text.slice(4, close + 1)).sohl.strikeMode;
    const mode = Object.create(StrikeModeBase.prototype) as StrikeModeBase;
    mode.traits = data.traits;
    (mode as unknown as { impact: { aspectType: string } }).impact = {
        aspectType: data.impactBase.aspect,
    };
    return mode;
}
describe("published Strength Trial TA bonuses agree with authored modes", () => {
    it.each(["Press", "Grab", "Trip"])(
        "%s resolves the per-TA value stated by the rules",
        (name) => {
            const match = rules.match(new RegExp(`\\*\\*\\+(\\d+)\\*\\* for a ${name}`));
            expect(match, `missing ${name} per-TA rule`).not.toBeNull();
            const stated = Number(match![1]);
            const mode = authoredMode(name);
            expect(impactTacticalAdvantageValue(mode)).toBe(stated);
            expect(impactTacticalAdvantageBonus(mode, 2)).toBe(stated * 2);
            expect(impactTacticalAdvantageBonus(mode, 0)).toBe(0);
        },
    );
    it("Grab explicitly retains the approved +3 Strength Trial bonus", () => {
        const mode = authoredMode("Grab");
        expect(mode.traits.impTA).toBe(3);
        expect(impactTacticalAdvantageValue(mode)).toBe(3);
    });
});
