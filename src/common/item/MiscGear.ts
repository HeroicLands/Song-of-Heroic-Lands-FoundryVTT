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
import { SohlDataModel } from "@common";
import { SohlAction } from "@common/event";
import { GearMixin, SohlItem } from "@common/item";
import { SohlLogic } from "@common/SohlLogic";
import { RegisterClass } from "@utils/decorators";
const kMiscGear = Symbol("MiscGear");
const kData = Symbol("MiscGear.Data");

@RegisterClass(
    new SohlLogic.Element({
        kind: "MiscGear",
    }),
)
export class MiscGear extends GearMixin(SohlLogic) implements MiscGear.Logic {
    declare readonly parent: MiscGear.Data;
    readonly [kMiscGear] = true;

    static isA(obj: unknown): obj is MiscGear {
        return typeof obj === "object" && obj !== null && kMiscGear in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace MiscGear {
    /**
     * The type moniker for the MiscGear item.
     */
    export const Kind = "miscgear";

    /**
     * The FontAwesome icon class for the MiscGear item.
     */
    export const IconCssClass = "fas fa-ball-pile";

    /**
     * The image path for the MiscGear item.
     */
    export const Image = "systems/sohl/assets/icons/miscgear.svg";

    export interface Logic extends SohlLogic.Logic {
        readonly parent: MiscGear.Data;
        readonly [kMiscGear]: true;
    }

    export interface Data extends SohlItem.Data {
        readonly [kData]: true;
        get logic(): MiscGear.Logic;
    }

    export const DataModelShape = GearMixin.DataModel(
        SohlItem.DataModel,
    ) as unknown as Constructor<MiscGear.Data> &
        SohlDataModel.TypeDataModelStatics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: MiscGear,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel extends DataModelShape {
        static override readonly LOCALIZATION_PREFIXES = ["MISCGEAR"];
        readonly [kData] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }
}
