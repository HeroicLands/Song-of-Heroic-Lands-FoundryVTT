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

import type { SohlEventContext } from "@common/event/SohlEventContext";
import type { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import type { Skill } from "./Skill";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import { StrikeMode, StrikeModeDataModel } from "@common/item/StrikeMode";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
import { CombatModifier } from "@common/modifier/CombatModifier";
import { ITEM_KIND } from "@utils/constants";
import { ValueModifier } from "@common/modifier/ValueModifier";
import { MeleeWeaponStrikeMode } from "./MeleeWeaponStrikeMode";
const { NumberField } = foundry.data.fields;

export class CombatTechniqueStrikeMode<
        TData extends
            CombatTechniqueStrikeMode.Data = CombatTechniqueStrikeMode.Data,
    >
    extends StrikeMode<TData>
    implements CombatTechniqueStrikeMode.Logic<TData>
{
    length!: ValueModifier;
    defense!: {
        block: CombatModifier;
        counterstrike: CombatModifier;
    };

    async blockTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.block.successTest(context)) || null;
    }

    async counterstrikeTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.counterstrike.successTest(context)) || null;
    }

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        this.defense = {
            block: new sohl.CONFIG.CombatModifier({}, { parent: this }),
            counterstrike: new sohl.CONFIG.CombatModifier({}, { parent: this }),
        };
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
        if (this.assocSkill) {
            this.defense.block.addVM(
                (this.assocSkill.logic as Skill).masteryLevel,
                {
                    includeBase: true,
                },
            );
            this.defense.counterstrike.addVM(
                (this.assocSkill.logic as Skill).masteryLevel,
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
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace CombatTechniqueStrikeMode {
    export const Kind = ITEM_KIND.COMBATTECHNIQUESTRIKEMODE;

    export interface Logic<
        TData extends
            CombatTechniqueStrikeMode.Data = CombatTechniqueStrikeMode.Data,
    > extends StrikeMode.Logic<TData> {
        length: ValueModifier;
        defense: {
            block: CombatModifier;
            counterstrike: CombatModifier;
        };
    }

    export interface Data<
        TLogic extends
            CombatTechniqueStrikeMode.Logic<Data> = CombatTechniqueStrikeMode.Logic<any>,
    > extends StrikeMode.Data<TLogic> {
        lengthBase: number;
    }
}

function defineCombatTechniqueStrikeModeSchema(): foundry.data.fields.DataSchema {
    return {
        ...StrikeModeDataModel.defineSchema(),
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
            CombatTechniqueStrikeMode.Logic<CombatTechniqueStrikeMode.Data> = CombatTechniqueStrikeMode.Logic<
            CombatTechniqueStrikeMode.Data<CombatTechniqueStrikeMode.Logic<any>>
        >,
    >
    extends StrikeModeDataModel<TSchema, TLogic>
    implements CombatTechniqueStrikeMode.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["COMBATTECHNIQUESTRIKEMODE"];
    static override readonly kind = CombatTechniqueStrikeMode.Kind;
    lengthBase!: number;
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineCombatTechniqueStrikeModeSchema();
    }
}

export class CombatTechniqueStrikeModeSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template:
                "systems/sohl/templates/item/combattechniquestrikemode.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
