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

import type { SohlActionContext } from "@src/common/SohlActionContext";
import type { ValueModifier } from "@src/common/modifier/ValueModifier";
import type { SkillLogic } from "@src/common/item/logic/SkillLogic";
import type { CombatModifier } from "@src/common/modifier/CombatModifier";
import type { SuccessTestResult } from "@src/common/result/SuccessTestResult";
import type { SohlTokenDocument } from "@src/common/token/SohlTokenDocument";
import {
    StrikeModeLogic,
    StrikeModeData,
} from "@src/common/item/logic/StrikeModeLogic";
import { ImpactAspect, ITEM_KIND, Variant } from "@src/utils/constants";

/**
 * Logic for the **Melee Weapon Strike Mode** item type — a way of attacking
 * with a melee weapon.
 *
 * Melee strike modes represent specific attack patterns for hand-to-hand
 * weapons: slashing with a sword, thrusting with a spear, bashing with a mace,
 * etc. They are typically nested inside {@link WeaponGearLogic | Weapon Gear}.
 *
 * In addition to the attack and impact modifiers inherited from
 * {@link StrikeModeLogic}, melee strike modes provide:
 *
 * - **defense.block** — Modifier for blocking incoming attacks with this weapon
 * - **defense.counterstrike** — Modifier for counterattacking after a successful defense
 * - **length** — Weapon reach, inherited from the parent weapon and affecting
 *   engagement range
 *
 * During evaluation, defense modifiers incorporate the associated skill's
 * mastery level and an **outnumbered penalty** (−10 per additional engaged
 * opponent beyond the first).
 *
 * @typeParam TData - The MeleeWeaponStrikeMode data interface.
 */
export class MeleeWeaponStrikeModeLogic<
    TData extends MeleeWeaponStrikeModeData = MeleeWeaponStrikeModeData,
> extends StrikeModeLogic<TData> {
    defense!: {
        block: CombatModifier;
        counterstrike: CombatModifier;
    };
    length!: ValueModifier;

    async blockTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.block.successTest(context)) || null;
    }

    async counterstrikeTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.counterstrike.successTest(context)) || null;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.defense = {
            block: new sohl.modifier.Combat({}, { parent: this }),
            counterstrike: new sohl.modifier.Combat({}, { parent: this }),
        };
        this.length = new sohl.modifier.Value({}, { parent: this });

        // Length is only set if this Strike Mode is nested in a WeaponGear
        if (this.item.nestedIn?.type === ITEM_KIND.WEAPONGEAR) {
            this.length.base = this.item.nestedIn.system.lengthBase;
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        if (this.assocSkill) {
            this.defense.block.addVM(
                (this.assocSkill.logic as SkillLogic).masteryLevel,
                {
                    includeBase: true,
                },
            );
            this.defense.counterstrike.addVM(
                (this.assocSkill.logic as SkillLogic).masteryLevel,
                { includeBase: true },
            );
        }

        const token = this.actor?.getActiveTokens().shift() as Token;
        const combatant = (token?.document as SohlTokenDocument).combatant;
        // If outnumbered, then add the outnumbered penalty to the defend "bonus" (in this case a penalty)
        if (combatant && !combatant.isDefeated) {
            const defendPenalty =
                Math.max(combatant.threatenedBy.length - 1, 0) * -10;
            if (defendPenalty) {
                this.defense.block.add(sohl.mod.OUTNUMBERED, defendPenalty);
                this.defense.counterstrike.add(
                    sohl.mod.OUTNUMBERED,
                    defendPenalty,
                );
            }
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface MeleeWeaponStrikeModeData<
    TLogic extends MeleeWeaponStrikeModeLogic<MeleeWeaponStrikeModeData> =
        MeleeWeaponStrikeModeLogic<any>,
> extends StrikeModeData<TLogic> {
    subType: Variant;
    mode: string;
    minParts: number;
    assocSkillName: string;
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };
    /** Effective melee reach of this attack mode */
    lengthBase: number;
}
