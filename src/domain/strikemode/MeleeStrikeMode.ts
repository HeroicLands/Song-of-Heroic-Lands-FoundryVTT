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
import { CombatModifier } from "@src/domain/modifier/CombatModifier";
import { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";

/**
 * A melee strike mode — close-combat attack with accuracy, reach, and
 * defense capabilities (block and counterstrike).
 */
export class MeleeStrikeMode extends StrikeModeBase {
    /** How precisely this mode can target a specific body part. */
    readonly strikeAccuracy: ValueModifier;
    /** Length of the weapon in this mode (feet). */
    readonly length: ValueModifier;
    /** Effective melee engagement range (feet). */
    readonly reach: ValueModifier;
    /** Defense modifiers for block and counterstrike. */
    readonly defense: {
        block: CombatModifier;
        counterstrike: CombatModifier;
    };

    constructor(
        data: MeleeStrikeMode.Data,
        parentLogic: SohlLogic,
        index: number,
    ) {
        super(data, parentLogic, index);
        this.strikeAccuracy = new ValueModifier(
            {},
            { parent: parentLogic },
        ).setBase(data.strikeAccuracy);
        this.length = new ValueModifier(
            {},
            { parent: parentLogic },
        ).setBase(data.lengthBase);
        this.reach = new ValueModifier(
            {},
            { parent: parentLogic },
        ).setBase(data.lengthBase);
        this.defense = {
            block: new CombatModifier({}, { parent: parentLogic }),
            counterstrike: new CombatModifier({}, { parent: parentLogic }),
        };
    }
}

export namespace MeleeStrikeMode {
    export interface Data extends StrikeModeBase.Data {
        type: "melee";
        strikeAccuracy: number;
        lengthBase: number;
    }
}
