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
import { RegisterClass } from "@utils/decorators";
import { StrikeModeMixin } from "./StrikeModeMixin";
import { SohlAction, SohlEvent } from "@common/event";
import { SohlDataModel } from "@common/SohlDataModel";
import { SohlItem } from ".";
const kCombatTechniqueStrikeMode = Symbol("CombatTechniqueStrikeMode");
const kDataModel = Symbol("CombatTechniqueStrikeMode.DataModel");
const { NumberField } = (foundry.data as any).fields;

@RegisterClass(
    new SohlLogic.Element({
        kind: "CombatTechniqueStrikeModeLogic",
    }),
)
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
    /**
     * The type moniker for the CombatTechniqueStrikeMode item.
     */
    export const Kind = "combattechniquestrikemode";

    /**
     * The FontAwesome icon class for the CombatTechniqueStrikeMode item.
     */
    export const IconCssClass = "fas fa-hand-fist";

    /**
     * The image path for the CombatTechniqueStrikeMode item.
     */
    export const Image = "systems/sohl/assets/icons/punch.svg";

    export interface Logic extends SohlLogic.Logic {
        parent: Data;
    }

    export interface Data extends SohlItem.Data {
        lengthBase: number;
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: CombatTechniqueStrikeMode,
            iconCssClass: IconCssClass,
            img: Image,
            sheet: "systems/sohl/templates/item/combattechniquestrikemode-sheet.hbs",
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel
        extends StrikeModeMixin.DataModel(SohlItem.DataModel)
        implements Data
    {
        static override readonly LOCALIZATION_PREFIXES = [
            "CombatTechniqueStrikeMode",
        ];
        declare lengthBase: number;
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
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
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template:
                        "systems/sohl/templates/item/combattechniquestrikemode.hbs",
                },
            });
    }
}
