/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { SohlSystem } from "@common";
import { LgndCombatModifier, LgndImpactModifier } from "@legendary/modifier";
import {
    LgndSuccessTestResult,
    LgndOpposedTestResult,
    LgndCombatResult,
} from "@legendary/result";

const LgndActorDataModels = {};

const LgndItemDataModels = {};

export class LegendarySystem extends SohlSystem {
    static override get CONFIG(): SohlSystem.Config {
        return foundry.utils.mergeObject(
            SohlSystem.CONFIG,
            {
                Actor: {
                    dataModels: LgndActorDataModels,
                },
                Item: {
                    dataModels: LgndItemDataModels,
                },
                CombatModifier: LgndCombatModifier,
                ImpactModifier: LgndImpactModifier,
                SuccessTestResult: LgndSuccessTestResult,
                OpposedTestResult: LgndOpposedTestResult,
                CombatResult: LgndCombatResult,
            },
            { inplace: false },
        ) as unknown as SohlSystem.Config;
    }

    static override readonly ID: string = "legendary";
    static override readonly TITLE: string = "Legendary";
    static override readonly INIT_MESSAGE: string = ` _                               _
    | |                             | |
    | |     ___  __ _  ___ _ __   __| | __ _ _ __ _   _
    | |    / _ \\/ _\` |/ _ \\ '_ \\ / _\` |/ _\` | '__| | | |
    | |___|  __/ (_| |  __/ | | | (_| | (_| | |  | |_| |
    \\_____/\\___|\\__, |\\___|_| |_|\\__,_|\\__,_|_|   \\__, |
                 __/ |                             __/ |
                |___/                             |___/
    ===========================================================`;

    static {
        this._variants.set(this.ID, new LegendarySystem());
    }
}
