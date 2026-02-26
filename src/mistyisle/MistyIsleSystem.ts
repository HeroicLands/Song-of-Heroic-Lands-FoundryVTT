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

import { SohlSystem } from "@common/SohlSystem";
import { IsleCombatModifier } from "@mistyisle/core/modifier/IsleCombatModifier";
import { IsleImpactModifier } from "@mistyisle/core/modifier/IsleImpactModifier";
import { IsleSuccessTestResult } from "@mistyisle/core/result/IsleSuccessTestResult";
import { IsleOpposedTestResult } from "@mistyisle/core/result/IsleOpposedTestResult";
import { IsleCombatResult } from "@mistyisle/core/result/IsleCombatResult";

const IsleActorDataModels = {};

const IsleItemDataModels = {};

export class MistyIsleSystem extends SohlSystem {
    static override get CONFIG(): SohlSystem.Config {
        return foundry.utils.mergeObject(
            SohlSystem.CONFIG,
            {
                Actor: {
                    dataModels: IsleActorDataModels,
                },
                Item: {
                    dataModels: IsleItemDataModels,
                },
                CombatModifier: IsleCombatModifier,
                ImpactModifier: IsleImpactModifier,
                SuccessTestResult: IsleSuccessTestResult,
                OpposedTestResult: IsleOpposedTestResult,
                CombatResult: IsleCombatResult,
            },
            { inplace: false },
        ) as unknown as SohlSystem.Config;
    }

    static override readonly ID: string = "mistyisle";
    static override readonly TITLE: string = "mistyisle";
    static override readonly INIT_MESSAGE: string = `___  ____     _           _____    _      
|  \\/  (_)   | |         |_   _|  | |     
| .  . |_ ___| |_ _   _    | | ___| | ___ 
| |\\/| | / __| __| | | |   | |/ __| |/ _ \\
| |  | | \\__ \\ |_| |_| |  _| |\\__ \\ |  __/
\\_|  |_/_|___/\\__|\\__, |  \\___/___/_|\\___|
                   __/ |                  
                  |___/                   
===========================================================`;

    private static _instance: MistyIsleSystem | null = null;

    static getInstance(): MistyIsleSystem {
        if (!this._instance) {
            this._instance = new MistyIsleSystem();
        }
        return this._instance;
    }

    override setupSheets(): void {
        throw new Error("Method not implemented.");
    }
}
