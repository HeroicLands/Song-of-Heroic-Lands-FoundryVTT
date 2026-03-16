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
import type { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import type { SkillLogic } from "@common/item/Skill";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    StrikeModeLogic,
    StrikeModeDataModel,
    StrikeModeData,
} from "@common/item/StrikeMode";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
import { CombatModifier } from "@common/modifier/CombatModifier";
import { ITEM_KIND, ITEM_METADATA } from "@utils/constants";
import { ValueModifier } from "@common/modifier/ValueModifier";
const { NumberField, StringField } = foundry.data.fields;

/**
 * Logic for the **Combat Technique Strike Mode** item type — a specialized
 * combat maneuver or fighting style.
 *
 * Combat technique strike modes represent trained maneuvers that go beyond
 * basic weapon attacks: grappling, disarming, tripping, shield bashing,
 * and other specialized fighting techniques. Unlike weapon-based strike modes,
 * these are tied to a combat technique skill rather than a specific weapon.
 *
 * Like {@link MeleeWeaponStrikeModeLogic}, combat techniques provide:
 *
 * - **defense.block** — Modifier for defensive use of the technique
 * - **defense.counterstrike** — Modifier for counterattacking
 * - **length** — Effective range of the technique
 *
 * Defense modifiers incorporate the associated skill's mastery level and
 * the outnumbered penalty during evaluation.
 *
 * @typeParam TData - The CombatTechniqueStrikeMode data interface.
 */
export class CombatTechniqueStrikeModeLogic<
    TData extends CombatTechniqueStrikeModeData = CombatTechniqueStrikeModeData,
> extends StrikeModeLogic<TData> {
    length!: ValueModifier;
    defense!: {
        block: CombatModifier;
        counterstrike: CombatModifier;
    };

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
            block: new sohl.CONFIG.CombatModifier({}, { parent: this }),
            counterstrike: new sohl.CONFIG.CombatModifier({}, { parent: this }),
        };
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        if (this.assocSkill) {
            this.defense.block.addVM(
                (this.assocSkill.logic as unknown as SkillLogic).masteryLevel,
                {
                    includeBase: true,
                },
            );
            this.defense.counterstrike.addVM(
                (this.assocSkill.logic as unknown as SkillLogic).masteryLevel,
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
    override finalize(): void {
        super.finalize();
    }
}

export interface CombatTechniqueStrikeModeData<
    TLogic extends
        CombatTechniqueStrikeModeLogic<CombatTechniqueStrikeModeData> = CombatTechniqueStrikeModeLogic<any>,
> extends StrikeModeData<TLogic> {
    /** Combat technique group this mode belongs to */
    group?: string;
    /** Effective range of this combat technique */
    lengthBase: number;
}

function defineCombatTechniqueStrikeModeSchema(): foundry.data.fields.DataSchema {
    return {
        ...StrikeModeDataModel.defineSchema(),
        group: new StringField({}),
        lengthBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type CombatTechniqueStrikeModeSchema = ReturnType<
    typeof defineCombatTechniqueStrikeModeSchema
>;

export class CombatTechniqueStrikeModeDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = CombatTechniqueStrikeModeSchema,
        TLogic extends
            CombatTechniqueStrikeModeLogic<CombatTechniqueStrikeModeData> = CombatTechniqueStrikeModeLogic<
            CombatTechniqueStrikeModeData<CombatTechniqueStrikeModeLogic<any>>
        >,
    >
    extends StrikeModeDataModel<TSchema, TLogic>
    implements CombatTechniqueStrikeModeData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.CombatTechniqueStrikeMode", "SOHL.StrikeMode", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.COMBATTECHNIQUESTRIKEMODE;
    lengthBase!: number;
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineCombatTechniqueStrikeModeSchema();
    }
}

export class CombatTechniqueStrikeModeSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
