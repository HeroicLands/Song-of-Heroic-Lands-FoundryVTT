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

import { ImpactResult } from "@common/result/ImpactResult";
import { ATTACK_MISHAP, TEST_TYPE, VALUE_DELTA_ID } from "@utils/constants";

export class AttackResult extends ImpactResult {
    situationalModifier: number;
    allowedDefenses: Set<string>;
    damage: number;
    modifiers: Map<string, string>;

    constructor(
        data: Partial<AttackResult.Data> = {},
        options: Partial<AttackResult.Options> = {},
    ) {
        super(data, options);
        this.situationalModifier = data.situationalModifier ?? 0;
        this.allowedDefenses = new Set(data.allowedDefenses ?? []);
        this.damage = data.damage ?? 0;
        this.modifiers = new Map(data.modifiers ?? []);
    }

    async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (
            this.testType === TEST_TYPE.MELEEATTACK.id ||
            this.testType === TEST_TYPE.AUTOCOMBATMELEE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(ATTACK_MISHAP.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(ATTACK_MISHAP.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        }
        if (
            this.testType === TEST_TYPE.MISSILEATTACK.id ||
            this.testType === TEST_TYPE.AUTOCOMBATMISSILE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(ATTACK_MISHAP.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(ATTACK_MISHAP.MISSILE_MISFIRE);
            }
            this.deliversImpact = false;
        }

        this.deliversImpact = this.isSuccess;
        return true;
    }

    async testDialog(
        data: PlainObject = {},
        callback: (formData: StrictObject<string | number>) => void,
    ): Promise<any> {
        const newData = {
            ...data,
            impactSituationalModifier: this.situationalModifier,
            impactMod: this.impactModifier,
            deliversImpact: this.deliversImpact,
        };

        return await super.testDialog(
            newData,
            (formData: StrictObject<string | number>) => {
                const formImpactSituationalModifier =
                    Number.parseInt(
                        String(formData.impactSituationalModifier),
                        10,
                    ) || 0;

                if (this.impactModifier && formImpactSituationalModifier) {
                    this.impactModifier.add(
                        VALUE_DELTA_ID.PLAYER,
                        formImpactSituationalModifier,
                    );
                    this.situationalModifier = formImpactSituationalModifier;
                }

                // Chain the new callback
                if (callback) callback.call(this, formData);
            },
        );
    }

    async toChat(data = {}) {
        return super.toChat({
            ...data,
            impactSituationalModifier: this.situationalModifier,
            impactMod: this.impactModifier,
            deliversImpact: this.deliversImpact,
        });
    }
}

export namespace AttackResult {
    export const Kind: string = "AttackResult";

    export interface Data extends ImpactResult.Data {
        situationalModifier: number;
        allowedDefenses: Set<string>;
        damage: number;
        modifiers: Map<string, string>;
    }

    export interface Options extends ImpactResult.Options {}

    export interface ContextScope {
        priorTestResult: AttackResult | null;
    }
}
