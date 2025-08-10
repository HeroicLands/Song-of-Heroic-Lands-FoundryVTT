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
import { SohlLogic } from "@common/SohlLogic";
import { SohlItem } from "@common/item/SohlItem";
import { StrikeModeMixin } from "@common/item/StrikeModeMixin";
import type { SohlAction } from "@common/event/SohlAction";
const kCombatTechniqueStrikeMode = Symbol("CombatTechniqueStrikeMode");
const kData = Symbol("CombatTechniqueStrikeMode.Data");
const { NumberField } = foundry.data.fields;

export class CombatTechniqueStrikeMode
    extends SohlLogic
    implements CombatTechniqueStrikeMode.Logic
{
    declare readonly parent: CombatTechniqueStrikeMode.Data;
    readonly [kCombatTechniqueStrikeMode] = true;

    static isA(obj: unknown): obj is CombatTechniqueStrikeMode {
        return (
            typeof obj === "object" &&
            obj !== null &&
            kCombatTechniqueStrikeMode in obj
        );
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace CombatTechniqueStrikeMode {
    export interface Logic extends SohlLogic.Logic {
        readonly parent: CombatTechniqueStrikeMode.Data;
        readonly [kCombatTechniqueStrikeMode]: true;
    }

    export interface Data extends SohlItem.Data {
        readonly [kData]: true;
        readonly logic: Logic;
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
        declare lengthBase: number;
        declare _logic: Logic;
        readonly [kData] = true;

        get logic(): Logic {
            this._logic ??= new CombatTechniqueStrikeMode(this);
            return this._logic;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
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
