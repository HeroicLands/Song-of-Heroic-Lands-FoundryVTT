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

import {
    DefendResult,
    ValueFrom,
    ImpactResult,
    isTestTypeFor,
} from "@logic/common/core/result";
import { CollectionType, DataField, RegisterClass } from "@utils";
import { ContextMenuSortGroup } from "@foundry/core";

export const TacticalAdvantages = {
    IMPACT: "impact",
    PRECISION: "precision",
    ACTION: "action",
    SETUP: "setup",
} as const;

export function isTacticalAdvantage(
    value: unknown,
): value is ValueFrom<typeof TacticalAdvantages> {
    return Object.values(TacticalAdvantages).includes(
        value as ValueFrom<typeof TacticalAdvantages>,
    );
}

@RegisterClass("AttackResult", "0.6.0")
export class AttackResult extends ImpactResult {
    @DataField("situationalModifier", { type: Number, initial: 0 })
    situationalModifier!: number;

    @DataField("allowedDefenses", {
        type: String,
        collection: CollectionType.SET,
        initial: () => Object.values(DefendResult.TestType).map((t) => t.id),
        validator: (value) => isTestTypeFor(DefendResult, value),
    })
    allowedDefenses!: Set<string>;

    @DataField("damage", { type: Number, initial: 0 })
    damage!: number;

    @DataField("modifiers", {
        type: String,
        collection: CollectionType.MAP,
    })
    modifiers!: Map<string, string>;

    static override readonly Mishap = {
        ...super.Mishap,
        STUMBLE_TEST: "stumbletest",
        STUMBLE: "stumble",
        FUMBLE_TEST: "fumbletest",
        FUMBLE: "fumble",
        WEAPON_BREAK: "weaponBreak",
        MISSILE_MISFIRE: "missileMisfire",
    } as const;

    static override readonly TestType = {
        AUTOCOMBATMELEE: {
            id: "autoCombatMelee",
            iconClass: "fas fa-swords",
            condition: true,
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        AUTOCOMBATMISSILE: {
            id: "autoCombatMissile",
            iconClass: "fas fa-bow-arrow",
            condition: true,
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        MISSILEATTACK: {
            id: "missileAttackTest",
            iconClass: "fas fa-bow-arrow",
            condition: true,
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        MELEEATTACK: {
            id: "meleeAttackTest",
            iconClass: "fas fa-sword",
            condition: true,
            group: ContextMenuSortGroup.ESSENTIAL,
        },
    } as const;

    static override readonly TestTypeEnum = Object.freeze(
        Object.fromEntries(
            Object.entries(AttackResult.TestType).map(([key, value]) => [
                key,
                value.id,
            ]),
        ),
    ) as StrictObject<string>;

    async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (
            this.testType === AttackResult.TestType.MELEEATTACK.id ||
            this.testType === AttackResult.TestType.AUTOCOMBATMELEE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(AttackResult.Mishap.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(AttackResult.Mishap.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        }
        if (
            this.testType === AttackResult.TestType.MISSILEATTACK.id ||
            this.testType === AttackResult.TestType.AUTOCOMBATMISSILE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(AttackResult.Mishap.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(AttackResult.Mishap.MISSILE_MISFIRE);
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
                        sohl.game.MOD.PLAYER,
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
