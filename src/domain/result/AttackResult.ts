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

import { registerKind } from "@src/utils/kindRegistry";
import { ATTACK_MISHAP, TEST_TYPE, VALUE_DELTA_ID } from "@src/utils/constants";
import { SuccessTestResult } from "./SuccessTestResult";
import { ImpactModifier } from "../modifier/ImpactModifier";

/**
 * The attacker's side of a combat exchange — a {@link SuccessTestResult} with
 * attack-specific data (the impact formula and the targeted body part).
 *
 * ## Key properties
 *
 * - {@link impact} — the impact (damage) **formula/capability** for this attack
 *   (e.g. 2d6+5 edged). It is *not* rolled here: when the blow actually lands,
 *   {@link CombatResult} produces an `ImpactResult` from this modifier (the
 *   roll happens then). Final damage is determined downstream by impact
 *   resolution against the target's armor/body location.
 * - {@link aimBodyPartCode} — the targeted body part shortcode, carried through
 *   to the defense resume and the injury card.
 *
 * ## Evaluation
 *
 * {@link evaluate} performs the attack roll, determines success/failure, and
 * checks for attack-specific mishaps (stumble, fumble, missile misfire). On a
 * self-miss it disables {@link impact}; it does not roll impact (that is done
 * when the blow lands).
 */
export class AttackResult extends SuccessTestResult {
    impact: ImpactModifier;
    aimBodyPartCode: string;
    /**
     * Strike spread governing hit-location scatter from {@link aimBodyPartCode}
     * during injury resolution. Melee uses the strike mode's `spread`; missile
     * uses 6 (point blank) or 8 (normal direct).
     */
    spread: number;

    constructor(
        data: Partial<AttackResult.Data> = {},
        options: Partial<AttackResult.Options> = {},
    ) {
        super(data, options);
        this.impact = data.impact ?? new ImpactModifier();
        this.aimBodyPartCode = data.aimBodyPartCode ?? "";
        this.spread = data.spread ?? 0;
    }

    override async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (!this.isSuccess) {
            if (
                this.testType === TEST_TYPE.MELEEATTACK.id ||
                this.testType === TEST_TYPE.AUTOCOMBATMELEE.id
            ) {
                if (this.isCritical && this.lastDigit === 0) {
                    this.mishaps.add(ATTACK_MISHAP.FUMBLE_TEST);
                }
                if (this.isCritical && this.lastDigit === 5) {
                    this.mishaps.add(ATTACK_MISHAP.STUMBLE_TEST);
                }
            }
            if (
                this.testType === TEST_TYPE.MISSILEATTACK.id ||
                this.testType === TEST_TYPE.AUTOCOMBATMISSILE.id
            ) {
                if (this.isCritical && this.lastDigit === 0) {
                    this.mishaps.add(ATTACK_MISHAP.FUMBLE_TEST);
                }
                if (this.isCritical && this.lastDigit === 5) {
                    this.mishaps.add(ATTACK_MISHAP.MISSILE_MISFIRE);
                }
            }
            this.impact.disabledReason = "Attack missed";
        }

        return true;
    }

    override async testDialog(
        data: PlainObject = {},
        callback: (formData: StrictObject<string | number>) => void,
    ): Promise<any> {
        const newData = {
            ...data,
            impact: this.impact,
        };

        return await super.testDialog(
            newData,
            (formData: StrictObject<string | number>) => {
                const formImpactSituationalModifier =
                    Number.parseInt(
                        String(formData.impactSituationalModifier),
                        10,
                    ) || 0;

                if (this.impact && formImpactSituationalModifier) {
                    this.impact.add(
                        VALUE_DELTA_ID.PLAYER,
                        formImpactSituationalModifier,
                    );
                }

                // Chain the new callback
                if (callback) callback.call(this, formData);
            },
        );
    }

    override async toChat(data = {}) {
        return super.toChat({
            ...data,
            impact: this.impact,
        });
    }
}

export namespace AttackResult {
    export const Kind: string = "AttackResult";

    export interface Data extends SuccessTestResult.Data {
        /** The impact (damage) formula/capability for this attack. */
        impact: ImpactModifier;
        /** The body part shortcode targeted by this attack, if any */
        aimBodyPartCode: string;
        /** Strike spread for hit-location scatter (melee `spread`; missile 6/8). */
        spread: number;
    }

    export interface Options extends SuccessTestResult.Options {}

    export interface ContextScope {
        priorTestResult: AttackResult | null;
    }
}

registerKind(AttackResult.Kind, AttackResult);
