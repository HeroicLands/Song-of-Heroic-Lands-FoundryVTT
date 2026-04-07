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

import { SuccessTestResult } from "@src/domain/result/SuccessTestResult";
import { ImpactModifier } from "@src/domain/modifier/ImpactModifier";
import { SimpleRoll } from "@src/utils/SimpleRoll";
const kImpactResult = Symbol("ImpactResult");
const kData = Symbol("ImpactResult.Data");
const kContext = Symbol("ImpactResult.Context");

/**
 * Represents the raw damage of an attack or effect, including the damage dice, aspect,
 * and any situational modifiers.
 */
export class ImpactResult extends SuccessTestResult {
    impactModifier: ImpactModifier;
    deliversImpact: boolean;
    readonly [kImpactResult] = true;

    constructor(
        data: Partial<ImpactResult.Data> = {},
        options: Partial<ImpactResult.Options> = {},
    ) {
        super(data, options);
        this.impactModifier = data.impactModifier ?? new ImpactModifier();
        this.deliversImpact = data.deliversImpact ?? false;
    }
}

export namespace ImpactResult {
    export const Kind: string = "ImpactResult";

    export interface Data extends SuccessTestResult.Data {
        readonly [kData]: true;
        impactModifier: ImpactModifier;
        deliversImpact: boolean;
        roll: SimpleRoll;
    }

    export interface Options extends SuccessTestResult.Options {}

    export interface ContextScope {
        priorTestResult: ImpactResult | null;
    }
}
