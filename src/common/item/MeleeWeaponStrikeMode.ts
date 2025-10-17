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
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { Skill } from "@common/item/Skill";
import type { CombatModifier } from "@common/modifier/CombatModifier";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import type { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import { SohlItemSheetBase } from "@common/item/SohlItem";
import { StrikeMode, StrikeModeDataModel } from "@common/item/StrikeMode";
import { ImpactAspect, ITEM_KIND, Variant, Variants } from "@utils/constants";
const { NumberField, StringField } = foundry.data.fields;

export class MeleeWeaponStrikeMode<
        TData extends MeleeWeaponStrikeMode.Data = MeleeWeaponStrikeMode.Data,
    >
    extends StrikeMode<TData>
    implements MeleeWeaponStrikeMode.Logic
{
    defense!: {
        block: CombatModifier;
        counterstrike: CombatModifier;
    };
    length!: ValueModifier;

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
        this.length = new sohl.CONFIG.ValueModifier({}, { parent: this });

        // Length is only set if this Strike Mode is nested in a WeaponGear
        if (this.item.nestedIn?.type === ITEM_KIND.WEAPONGEAR) {
            this.length.base = this.item.nestedIn.system.lengthBase;
        }
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

export namespace MeleeWeaponStrikeMode {
    export const Kind = ITEM_KIND.MELEEWEAPONSTRIKEMODE;

    export interface Logic<
        TData extends MeleeWeaponStrikeMode.Data = MeleeWeaponStrikeMode.Data,
    > extends StrikeMode.Logic<TData> {
        length: ValueModifier;
        defense: {
            block: CombatModifier;
            counterstrike: CombatModifier;
        };
        blockTest(context: SohlEventContext): Promise<SuccessTestResult | null>;
        counterstrikeTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
    }

    export interface Data<
        TLogic extends
            MeleeWeaponStrikeMode.Logic<Data> = MeleeWeaponStrikeMode.Logic<any>,
    > extends StrikeMode.Data<TLogic> {
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
            MeleeWeaponStrikeMode.Logic<MeleeWeaponStrikeMode.Data> = MeleeWeaponStrikeMode.Logic<
            MeleeWeaponStrikeMode.Data<MeleeWeaponStrikeMode.Logic<any>>
        >,
    >
    extends StrikeModeDataModel<TSchema, TLogic>
    implements MeleeWeaponStrikeMode.Data
{
    static readonly LOCALIZATION_PREFIXES = ["MELEEWEAPONSTRIKEMODE"];
    static override readonly kind = MeleeWeaponStrikeMode.Kind;
    subType!: Variant;
    lengthBase!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMeleeWeaponStrikeModeSchema();
    }
}

export class MeleeWeaponStrikeModeSheet extends SohlItemSheetBase {
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
