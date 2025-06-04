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

import { DefendResult, ImpactResult, MISHAP } from "@common/result";
import {
    ClassRegistryElement,
    CONTEXTMENU_SORT_GROUP,
    defineType,
    SohlContextMenuEntry,
} from "@utils";
import { RegisterClass } from "@utils/decorators";
import { PerformerClassRegistryElement } from "../core/SohlPerformer";
import { VALUEDELTA_ID } from "../modifier";

export const {
    kind: TACTICAL_ADVANTAGES,
    values: tacticalAdvantages,
    isValue: isTacticalAdvantage,
} = defineType({
    IMPACT: "impact",
    PRECISION: "precision",
    ACTION: "action",
    SETUP: "setup",
});
export type AfflictionSubType =
    (typeof TACTICAL_ADVANTAGES)[keyof typeof TACTICAL_ADVANTAGES];

export const {
    kind: ATTACKRESULT_MISHAP,
    values: attackResultMishaps,
    isValue: isAttackResultMishap,
} = defineType({
    ...MISHAP,
    STUMBLE_TEST: "stumbletest",
    STUMBLE: "stumble",
    FUMBLE_TEST: "fumbletest",
    FUMBLE: "fumble",
    WEAPON_BREAK: "weaponBreak",
    MISSILE_MISFIRE: "missileMisfire",
});
export type AttackResultMishap =
    (typeof ATTACKRESULT_MISHAP)[keyof typeof ATTACKRESULT_MISHAP];

export const {
    kind: ATTACKRESULT_TESTTYPE,
    values: attackResultTestTypes,
    isValue: isAttackResultTestType,
} = defineType<StrictObject<SohlContextMenuEntry>>({
    AUTOCOMBATMELEE: {
        id: "autoCombatMelee",
        name: "Auto Combat Melee",
        iconClass: "fas fa-swords",
        condition: true,
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    AUTOCOMBATMISSILE: {
        id: "autoCombatMissile",
        name: "Auto Combat Missile",
        iconClass: "fas fa-bow-arrow",
        condition: true,
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    MISSILEATTACK: {
        id: "missileAttackTest",
        name: "Missile Attack Test",
        iconClass: "fas fa-bow-arrow",
        condition: true,
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    MELEEATTACK: {
        id: "meleeAttackTest",
        name: "Melee Attack Test",
        iconClass: "fas fa-sword",
        condition: true,
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
});
@RegisterClass(new ClassRegistryElement("AttackResult", AttackResult))
export class AttackResult extends ImpactResult {
    situationalModifier: number;
    allowedDefenses: Set<string>;
    damage: number;
    modifiers: Map<string, string>;

    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        super(data, options);
        this.situationalModifier = 0;
        this.allowedDefenses = new Set();
        this.damage = 0;
        this.modifiers = new Map();

        // Set default test type if not provided
        if (!this.testType) {
            this.testType = ATTACKRESULT_TESTTYPE.MELEEATTACK.id;
        }
    }

    async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (
            this.testType === ATTACKRESULT_TESTTYPE.MELEEATTACK.id ||
            this.testType === ATTACKRESULT_TESTTYPE.AUTOCOMBATMELEE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(ATTACKRESULT_MISHAP.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(ATTACKRESULT_MISHAP.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        }
        if (
            this.testType === ATTACKRESULT_TESTTYPE.MISSILEATTACK.id ||
            this.testType === ATTACKRESULT_TESTTYPE.AUTOCOMBATMISSILE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(ATTACKRESULT_MISHAP.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(ATTACKRESULT_MISHAP.MISSILE_MISFIRE);
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
                        VALUEDELTA_ID.PLAYER,
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
