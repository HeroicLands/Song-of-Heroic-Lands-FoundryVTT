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

import { SohlItem } from "@common/item/SohlItem";
import {
    kStrikeModeMixin,
    kStrikeModeMixinData,
    StrikeModeMixin,
} from "@common/item/StrikeModeMixin";
import type { SohlAction } from "@common/event/SohlAction";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
import { CombatModifier } from "@common/modifier/CombatModifier";
import { kSubTypeMixinData } from "./SubTypeMixin";
import { SohlTokenDocument } from "@common/token/SohlTokenDocument";
const kCombatTechniqueStrikeMode = Symbol("CombatTechniqueStrikeMode");
const kData = Symbol("CombatTechniqueStrikeMode.Data");
const { NumberField } = foundry.data.fields;

export class CombatTechniqueStrikeMode
    extends StrikeModeMixin(SohlItem.BaseLogic)
    implements CombatTechniqueStrikeMode.Logic
{
    declare [kStrikeModeMixin]: true;
    declare readonly parent: CombatTechniqueStrikeMode.Data;
    readonly [kCombatTechniqueStrikeMode] = true;
    defense!: {
        block: CombatModifier;
        counterstrike: CombatModifier;
    };

    static isA(obj: unknown): obj is CombatTechniqueStrikeMode {
        return (
            typeof obj === "object" &&
            obj !== null &&
            kCombatTechniqueStrikeMode in obj
        );
    }

    async blockTest(
        context: SohlAction.Context,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.block.successTest(context)) || null;
    }

    async counterstrikeTest(
        context: SohlAction.Context,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.counterstrike.successTest(context)) || null;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
        this.defense = {
            block: new sohl.CONFIG.CombatModifier({}, { parent: this }),
            counterstrike: new sohl.CONFIG.CombatModifier({}, { parent: this }),
        };
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
        if (this.assocSkill) {
            this.defense.block.addVM(this.assocSkill.system.masteryLevel, {
                includeBase: true,
            });
            this.defense.counterstrike.addVM(
                this.assocSkill.system.masteryLevel,
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
    override finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace CombatTechniqueStrikeMode {
    export interface Logic extends StrikeModeMixin.Logic {
        readonly parent: CombatTechniqueStrikeMode.Data;
        readonly [kCombatTechniqueStrikeMode]: true;
    }

    export interface Data extends StrikeModeMixin.Data {
        readonly [kData]: true;
        lengthBase: number;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export class DataModel
        extends StrikeModeMixin.DataModel(SohlItem.DataModel)
        implements Data
    {
        static override readonly LOCALIZATION_PREFIXES = [
            "CombatTechniqueStrikeMode",
        ];
        declare readonly [kStrikeModeMixinData]: true;
        declare readonly [kSubTypeMixinData]: true;
        readonly [kData] = true;
        lengthBase!: number;

        static override defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                lengthBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template:
                        "systems/sohl/templates/item/combattechniquestrikemode.hbs",
                },
            });
    }
}
