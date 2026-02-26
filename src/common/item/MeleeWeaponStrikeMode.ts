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

import type { SohlActionContext } from "@common/SohlActionContext";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { SkillLogic } from "@common/item/Skill";
import type { CombatModifier } from "@common/modifier/CombatModifier";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import type { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    StrikeModeLogic,
    StrikeModeDataModel,
    StrikeModeData,
} from "@common/item/StrikeMode";
import {
    ImpactAspect,
    ITEM_KIND,
    ITEM_METADATA,
    Variant,
    Variants,
} from "@utils/constants";
const { NumberField, StringField } = foundry.data.fields;

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
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
        this.defense = {
            block: new sohl.CONFIG.CombatModifier({}, { parent: this }),
            counterstrike: new sohl.CONFIG.CombatModifier({}, { parent: this }),
        };
        this.length = new sohl.CONFIG.ValueModifier({}, { parent: this });

        // Length is only set if this Strike Mode is nested in a WeaponGear
        if (this.item.nestedIn?.type === ITEM_KIND.WEAPONGEAR) {
            this.length.base = this.item.nestedIn.system.lengthBase;
        }
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
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
                this.defense.block.add(
                    sohl.CONFIG.MOD.OUTNUMBERED,
                    defendPenalty,
                );
                this.defense.counterstrike.add(
                    sohl.CONFIG.MOD.OUTNUMBERED,
                    defendPenalty,
                );
            }
        }
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface MeleeWeaponStrikeModeData<
    TLogic extends
        MeleeWeaponStrikeModeLogic<MeleeWeaponStrikeModeData> = MeleeWeaponStrikeModeLogic<any>,
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
    lengthBase: number;
}

function defineMeleeWeaponStrikeModeSchema(): foundry.data.fields.DataSchema {
    return {
        ...StrikeModeDataModel.defineSchema(),
        subType: new StringField({
            choices: Variants,
            required: true,
        }),

        lengthBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type MeleeWeaponStrikeModeSchema = ReturnType<
    typeof defineMeleeWeaponStrikeModeSchema
>;

export class MeleeWeaponStrikeModeDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = MeleeWeaponStrikeModeSchema,
        TLogic extends
            MeleeWeaponStrikeModeLogic<MeleeWeaponStrikeModeData> = MeleeWeaponStrikeModeLogic<MeleeWeaponStrikeModeData>,
    >
    extends StrikeModeDataModel<TSchema, TLogic>
    implements MeleeWeaponStrikeModeData
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.MeleeWeaponStrikeMode.DATA",
    ];
    static override readonly kind = ITEM_KIND.MELEEWEAPONSTRIKEMODE;
    subType!: Variant;
    lengthBase!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMeleeWeaponStrikeModeSchema();
    }
}

export class MeleeWeaponStrikeModeSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
