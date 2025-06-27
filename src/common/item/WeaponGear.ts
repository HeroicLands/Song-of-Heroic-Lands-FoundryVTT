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
import { SohlActor } from "@common/actor";
import { SohlAction } from "@common/event";
import { ArmorGear, GearMixin, SohlItem } from "@common/item";
import { HTMLString, DocumentId } from "@utils";
import { RegisterClass } from "@utils/decorators";

const { NumberField } = foundry.data.fields;
const kWeaponGear = Symbol("WeaponGear");
const kData = Symbol("WeaponGear.Data");

@RegisterClass(
    new SohlLogic.Element({
        kind: "WeaponGear",
    }),
)
export class WeaponGear
    extends GearMixin(SohlLogic)
    implements WeaponGear.Logic
{
    declare readonly parent: WeaponGear.Data;
    readonly [kWeaponGear] = true;

    static isA(obj: unknown): obj is WeaponGear {
        return typeof obj === "object" && obj !== null && kWeaponGear in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace WeaponGear {
    /**
     * The type moniker for the WeaponGear item.
     */
    export const Kind = "weapongear";

    /**
     * The FontAwesome icon class for the WeaponGear item.
     */
    export const IconCssClass = "fas fa-sword";

    /**
     * The image path for the WeaponGear item.
     */
    export const Image = "systems/sohl/assets/icons/sword.svg";

    export interface Logic extends SohlLogic.Logic {
        readonly parent: WeaponGear.Data;
        readonly [kWeaponGear]: true;
    }

    export interface Data extends SohlItem.Data {
        readonly [kData]: true;
        get logic(): WeaponGear.Logic;
        lengthBase: number;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    const DataModelShape = GearMixin.DataModel(
        SohlItem.DataModel,
    ) as unknown as Constructor<WeaponGear.Data> & SohlItem.DataModel.Statics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: WeaponGear,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel extends DataModelShape {
        static readonly LOCALIZATION_PREFIXES = ["WEAPONGEAR"];
        declare lengthBase: number;
        declare abbrev: string;
        declare quantity: number;
        declare weightBase: number;
        declare valueBase: number;
        declare isCarried: boolean;
        declare isEquipped: boolean;
        declare qualityBase: number;
        declare durabilityBase: number;
        readonly [kData] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
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
