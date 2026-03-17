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

import {
    ImpactAspect,
    Variant,
} from "@utils/constants";
import type { SohlActionContext } from "@common/SohlActionContext";
import type { CombatModifier } from "@common/modifier/CombatModifier";
import type { ImpactModifier } from "@common/modifier/ImpactModifier";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { GearLogic } from "@common/item/logic/GearLogic";
import type { SkillLogic } from "@common/item/logic/SkillLogic";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
} from "@common/item/foundry/SohlItem";
import { isGearItem } from "@utils/helpers";

/**
 * Abstract base logic for all strike modes — the foundation for
 * {@link MeleeWeaponStrikeModeLogic}, {@link MissileWeaponStrikeModeLogic},
 * and {@link CombatTechniqueStrikeModeLogic}.
 *
 * A strike mode represents a specific way of using a weapon or combat technique
 * to attack. For example, a sword might have "Slash" and "Thrust" strike modes,
 * each with different impact dice, aspects (blunt/pierce/cut), and associated
 * skills. Strike modes are typically nested inside a {@link WeaponGearLogic}
 * item or attached directly to a Being.
 *
 * Each strike mode tracks:
 * - **impact** — Damage dice and aspect (e.g., 2d6+1 cutting), as an {@link ImpactModifier}
 * - **attack** — Attack roll modifier, as a {@link CombatModifier}
 * - **assocSkill** — The skill used for attack tests (resolved by name from the actor)
 * - **durability** — Weapon durability, inherited from the parent weapon gear
 * - **traits** — Flags like `noAttack` or `noBlock` restricting usage
 *
 * During initialization, the strike mode resolves its associated skill from the
 * owning actor and incorporates the skill's mastery level into the attack modifier.
 *
 * @typeParam TData - The strike mode data interface.
 */
export abstract class StrikeModeLogic<
    TData extends StrikeModeData = StrikeModeData,
> extends SohlItemBaseLogic<TData> {
    traits!: PlainObject;
    assocSkill?: SohlItem;
    impact!: ImpactModifier;
    attack!: CombatModifier;
    durability!: ValueModifier;

    async attackTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return (await this.attack.successTest(context)) || null;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.traits = {
            noAttack: false,
            noBlock: false,
        };
        this.impact = new (sohl.CONFIG as any).ImpactModifier({}, { parent: this });
        this.attack = new (sohl.CONFIG as any).CombatModifier({}, { parent: this });
        this.durability = new (sohl.CONFIG as any).ValueModifier({}, { parent: this });
        this.impact.base = this.data.impactBase;
        const skills: SkillLogic[] =
            this.actor?.itemTypes.skill.map(
                (it) => (it as any).logic as SkillLogic,
            ) || [];
        const skill = skills.find(
            (s: SkillLogic) => s.name === this.data.assocSkillName,
        );
        if (skill) {
            this.assocSkill = skill.item;
            this.attack.addVM(skill.masteryLevel, {
                includeBase: true,
            });
        } else {
            sohl.log.warn("SOHL.StrikeMode.NoAssocSkillWarning", {
                label: sohl.i18n.localize(this.data.label as unknown as string),
                skillName: this.data.assocSkillName,
            });
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        if (this.item && isGearItem(this.item)) {
            this.durability.addVM(
                (this.nestedIn?.logic as GearLogic).durability,
            );
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface StrikeModeData<
    TLogic extends StrikeModeLogic<StrikeModeData> = StrikeModeLogic<any>,
> extends SohlItemData<TLogic> {
    /** Rules variant this strike mode belongs to */
    subType: Variant;
    /** Name of the attack mode (e.g., Slash, Thrust) */
    mode: string;
    /** Minimum number of body parts needed to use this strike mode */
    minParts: number;
    /** Name of the skill used for attack tests */
    assocSkillName: string;
    /** Base damage characteristics: dice, modifier, and aspect */
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };
}
