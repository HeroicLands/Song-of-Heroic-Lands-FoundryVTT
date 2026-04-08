/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlLogic } from "@src/core/SohlLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";

/**
 * A missile strike mode — ranged attack with projectile type, range,
 * and draw time.
 */
export class MissileStrikeMode extends StrikeModeBase {
    /** What ammunition this mode uses ("none" if the weapon itself is thrown). */
    readonly projectileType: string;
    /** Maximum volley multiplier for rapid fire. */
    readonly maxVolleyMult: number;
    /** Base range before modifiers (feet). */
    readonly baseRange: ValueModifier;
    /** Draw/reload time before firing. */
    readonly draw: ValueModifier;

    constructor(
        data: MissileStrikeMode.Data,
        parentLogic: SohlLogic,
        index: number,
    ) {
        super(data, parentLogic, index);
        this.projectileType = data.projectileType;
        this.maxVolleyMult = data.maxVolleyMult;
        this.baseRange = new ValueModifier(
            {},
            { parent: parentLogic },
        ).setBase(data.baseRangeBase);
        this.draw = new ValueModifier(
            {},
            { parent: parentLogic },
        ).setBase(data.drawBase);
    }
}

export namespace MissileStrikeMode {
    export interface Data extends StrikeModeBase.Data {
        type: "missile";
        projectileType: string;
        maxVolleyMult: number;
        baseRangeBase: number;
        drawBase: number;
    }
}
