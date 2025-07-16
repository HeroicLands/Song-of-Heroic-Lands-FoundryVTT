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
import { ProjectileGear, SohlItem, StrikeModeMixin } from ".";

const kMissileWeaponStrikeMode = Symbol("MissileWeaponStrikeMode");
const kDataModel = Symbol("MissileWeaponStrikeMode.DataModel");
const { StringField } = (foundry.data as any).fields;

@RegisterClass(
    new SohlLogic.Element({
        kind: "MissileWeaponStrikeMode",
    }),
)
export class MissileWeaponStrikeMode<
        TData extends
            MissileWeaponStrikeMode.Data = MissileWeaponStrikeMode.Data,
    >
    extends SohlLogic
    implements MissileWeaponStrikeMode.Logic
{
    declare readonly parent: TData;
    readonly [kMissileWeaponStrikeMode] = true;

    static isA(obj: unknown): obj is MissileWeaponStrikeMode {
        return (
            typeof obj === "object" &&
            obj !== null &&
            kMissileWeaponStrikeMode in obj
        );
    }
    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace MissileWeaponStrikeMode {
    /**
     * The type moniker for the MissileWeaponStrikeMode item.
     */
    export const Kind = "missileweaponstrikemode";
    /**
     * The FontAwesome icon class for the MissileWeaponStrikeMode item.
     */
    export const IconCssClass = "fas fa-bow-arrow";

    /**
     * The image path for the MissileWeaponStrikeMode item.
     */
    export const Image = "systems/sohl/assets/icons/longbow.svg";

    export interface Logic extends SohlLogic.Logic {}

    export interface Data extends SohlItem.Data {
        projectileType: ProjectileGear.SubType;
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: MissileWeaponStrikeMode,
            iconCssClass: IconCssClass,
            img: Image,
            sheet: "systems/sohl/templates/item/missilestrikemode-sheet.hbs",
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel
        extends StrikeModeMixin.DataModel(SohlItem.DataModel)
        implements Data
    {
        declare projectileType: ProjectileGear.SubType;
        static readonly LOCALIZATION_PREFIXES = ["MissileWeaponStrikeMode"];
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                projectileType: new StringField({
                    initial: ProjectileGear.SUBTYPE.NONE,
                    required: true,
                    choices: ProjectileGear.SubTypes,
                }),
            };
        }
    }
}
