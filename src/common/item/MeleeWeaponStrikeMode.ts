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
import { SohlDataModel, SohlLogic } from "@common";
import { SohlAction } from "@common/event";
import { RegisterClass } from "@utils/decorators";
import { SohlItem, StrikeModeMixin } from ".";

const kMeleeWeaponStrikeMode = Symbol("MeleeWeaponStrikeMode");
const kDataModel = Symbol("MeleeWeaponStrikeMode.DataModel");
const { NumberField } = (foundry.data as any).fields;

@RegisterClass(
    new SohlLogic.Element({
        kind: "MeleeWeaponStrikeMode",
    }),
)
export class MeleeWeaponStrikeMode<
        TData extends MeleeWeaponStrikeMode.Data = MeleeWeaponStrikeMode.Data,
    >
    extends SohlLogic<MeleeWeaponStrikeMode.Data>
    implements MeleeWeaponStrikeMode.Logic<TData>
{
    declare readonly parent: TData;
    readonly [kMeleeWeaponStrikeMode] = true;

    static isA(obj: unknown): obj is MeleeWeaponStrikeMode {
        return (
            typeof obj === "object" &&
            obj !== null &&
            kMeleeWeaponStrikeMode in obj
        );
    }
    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace MeleeWeaponStrikeMode {
    /**
     * The type moniker for the MeleeWeaponStrikeMode item.
     */
    export const Kind = "meleeweaponstrikemode";

    /**
     * The FontAwesome icon class for the MeleeWeaponStrikeMode item.
     */
    export const IconCssClass = "fas fa-sword";

    /**
     * The image path for the MeleeWeaponStrikeMode item.
     */
    export const Image = "systems/sohl/assets/icons/sword.svg";

    export interface Logic<TData extends Data = Data>
        extends SohlLogic.Logic<TData> {}

    export interface Data extends SohlItem.Data {}

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: MeleeWeaponStrikeMode,
            iconCssClass: IconCssClass,
            img: Image,
            sheet: "systems/sohl/templates/item/meleestrikemode-sheet.hbs",
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel
        extends StrikeModeMixin.DataModel(SohlItem.DataModel)
        implements Data
    {
        static readonly LOCALIZATION_PREFIXES = ["MeleeWeaponStrikeMode"];
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
}
