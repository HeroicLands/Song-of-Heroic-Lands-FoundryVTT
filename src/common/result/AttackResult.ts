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

import { ValueDelta } from "@common/modifier";
import { ImpactResult, SuccessTestResult } from "@common/result";
import { defineType, SohlClassRegistry, SohlContextMenu } from "@utils";
import { RegisterClass } from "@utils/decorators";
const kAttackResult = Symbol("AttackResult");
const kData = Symbol("AttackResult.Data");
const kContext = Symbol("AttackResult.Context");

@RegisterClass(new SohlClassRegistry.Element("AttackResult", AttackResult))
export class AttackResult extends ImpactResult {
    situationalModifier: number;
    allowedDefenses: Set<string>;
    damage: number;
    modifiers: Map<string, string>;
    readonly [kAttackResult] = true;

    static isA(obj: unknown): obj is AttackResult {
        return typeof obj === "object" && obj !== null && kAttackResult in obj;
    }

    constructor(
        data: Partial<AttackResult.Data> = {},
        options: Partial<AttackResult.Options> = {},
    ) {
        super(data, options);
        this.situationalModifier = data.situationalModifier ?? 0;
        this.allowedDefenses = new Set(data.allowedDefenses ?? []);
        this.damage = data.damage ?? 0;
        this.modifiers = new Map(data.modifiers ?? []);

        // Set default test type if not provided
        if (!this.testType) {
            this.testType = AttackResult.TESTTYPE.MELEEATTACK.id;
        }
    }

    async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (
            this.testType === AttackResult.TESTTYPE.MELEEATTACK.id ||
            this.testType === AttackResult.TESTTYPE.AUTOCOMBATMELEE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(AttackResult.ATTACK_MISHAP.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(AttackResult.ATTACK_MISHAP.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        }
        if (
            this.testType === AttackResult.TESTTYPE.MISSILEATTACK.id ||
            this.testType === AttackResult.TESTTYPE.AUTOCOMBATMISSILE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(AttackResult.ATTACK_MISHAP.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(AttackResult.ATTACK_MISHAP.MISSILE_MISFIRE);
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
                        ValueDelta.ID.PLAYER,
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
    export const {
        kind: TACTICAL_ADVANTAGES,
        values: tacticalAdvantages,
        isValue: isTacticalAdvantage,
    } = defineType("SOHL.AttackResult.TacticalAdvantage", {
        IMPACT: "impact",
        PRECISION: "precision",
        ACTION: "action",
        SETUP: "setup",
    });
    export type AfflictionSubType =
        (typeof TACTICAL_ADVANTAGES)[keyof typeof TACTICAL_ADVANTAGES];

    export const {
        kind: ATTACK_MISHAP,
        values: AttackMishaps,
        isValue: isAttackMishap,
    } = defineType("SOHL.AttackResult.Mishap", {
        STUMBLE_TEST: "stumbletest",
        STUMBLE: "stumble",
        FUMBLE_TEST: "fumbletest",
        FUMBLE: "fumble",
        WEAPON_BREAK: "weaponBreak",
        MISSILE_MISFIRE: "missileMisfire",
    });
    export type AttackMishap =
        (typeof ATTACK_MISHAP)[keyof typeof ATTACK_MISHAP];

    export const {
        kind: TESTTYPE,
        values: TestTypes,
        isValue: isTestType,
    } = defineType("SOHL.AttackResult.TestType", {
        AUTOCOMBATMELEE: {
            id: "autoCombatMelee",
            name: "Auto Combat Melee",
            iconClass: "fas fa-swords",
            condition: true,
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        },
        AUTOCOMBATMISSILE: {
            id: "autoCombatMissile",
            name: "Auto Combat Missile",
            iconClass: "fas fa-bow-arrow",
            condition: true,
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        },
        MISSILEATTACK: {
            id: "missileAttackTest",
            name: "Missile Attack Test",
            iconClass: "fas fa-bow-arrow",
            condition: true,
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        },
        MELEEATTACK: {
            id: "meleeAttackTest",
            name: "Melee Attack Test",
            iconClass: "fas fa-sword",
            condition: true,
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        },
    });

    export interface Data extends ImpactResult.Data {
        readonly [kData]: true;
        situationalModifier: number;
        allowedDefenses: Set<string>;
        damage: number;
        modifiers: Map<string, string>;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is AttackResult.Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export interface Options extends ImpactResult.Options {}

    export class Context extends ImpactResult.Context {
        readonly [kContext] = true;

        isA(obj: unknown): obj is Context {
            return typeof obj === "object" && obj !== null && kContext in obj;
        }

        constructor(data: Partial<AttackResult.Context.Data> = {}) {
            super(data);
        }
    }

    export namespace Context {
        export interface Data extends ImpactResult.Context.Data {
            testResult: Nullable<AttackResult.Data>;
        }
    }
}
