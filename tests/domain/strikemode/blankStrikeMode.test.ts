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
import { blankStrikeMode } from "@src/entity/strikemode/blankStrikeMode";
import { IMPACT_ASPECT, STRIKE_MODE_TYPE } from "@src/utils/constants";
import type { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";

describe("blankStrikeMode", () => {
    it("builds a melee mode with schema-default fields", () => {
        const sm = blankStrikeMode(
            STRIKE_MODE_TYPE.MELEE,
            "Cut",
        ) as MeleeStrikeMode.Data;
        expect(sm.type).toBe(STRIKE_MODE_TYPE.MELEE);
        expect(sm.name).toBe("Cut");
        expect(sm.minParts).toBe(1);
        expect(sm.assocSkillCode).toBe("");
        expect(sm.attack).toEqual({ disabled: false, spread: 0, modifier: 0 });
        expect(sm.impactBase).toEqual({
            numDice: 0,
            die: null,
            modifier: null,
            aspect: IMPACT_ASPECT.BLUNT,
        });
        expect(sm.traits).toEqual({});
        // melee-only fields
        expect(sm.lengthBase).toBe(0);
        expect(sm.defense.block).toEqual({
            disabled: false,
            modifier: 0,
            successLevelMod: 0,
        });
        expect(sm.defense.counterstrike).toEqual({
            disabled: false,
            modifier: 0,
            successLevelMod: 0,
        });
    });

    it("builds a missile mode with schema-default fields", () => {
        const sm = blankStrikeMode(
            STRIKE_MODE_TYPE.MISSILE,
            "Shoot",
        ) as MissileStrikeMode.Data;
        expect(sm.type).toBe(STRIKE_MODE_TYPE.MISSILE);
        expect(sm.name).toBe("Shoot");
        expect(sm.projectileType).toBe("none");
        expect(sm.maxVolleyMult).toBe(1);
        expect(sm.baseRangeBase).toBe(0);
        expect(sm.drawBase).toBe(0);
        // no melee-only fields leak into a missile mode
        expect((sm as any).lengthBase).toBeUndefined();
        expect((sm as any).defense).toBeUndefined();
    });

    it("defaults the name to 'Strike' when omitted", () => {
        expect(blankStrikeMode(STRIKE_MODE_TYPE.MELEE).name).toBe("Strike");
    });
});
