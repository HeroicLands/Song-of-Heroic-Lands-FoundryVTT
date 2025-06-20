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
import { RegisterClass } from "@utils/decorators";
import { SubTypeMixin } from "./SubTypeMixin";
import { SohlDataModel, SohlLogic } from "@common";
import { SohlAction } from "@common/event";
import { defineType } from "@utils";
import { SohlItem } from "@common/item";
const { StringField } = foundry.data.fields;
const kPhilosophy = Symbol("Philosophy");
const kData = Symbol("Philosophy.Data");

@RegisterClass(
    new SohlLogic.Element({
        kind: "Philosophy",
    }),
)
export class Philosophy extends SohlLogic implements Philosophy.Logic {
    declare readonly parent: Philosophy.Data;
    readonly [kPhilosophy] = true;

    static isA(obj: unknown): obj is Philosophy {
        return typeof obj === "object" && obj !== null && kPhilosophy in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace Philosophy {
    /**
     * The type moniker for the Philosophy item.
     */
    export const Kind = "philosophy";

    /**
     * The FontAwesome icon class for the Philosophy item.
     */
    export const IconCssClass = "fas fa-sparkle";

    /**
     * The image path for the Philosophy item.
     */
    export const Image = "systems/sohl/assets/icons/sparkle.svg";

    export const {
        kind: SUBTYPE,
        values: SubTypes,
        isValue: isSubType,
    } = defineType("SOHL.Philosophy.SUBTYPE", {
        ARCANE: "arcane",
        DIVINE: "divine",
        SPIRIT: "spirit",
        ASTRAL: "astral",
        NATURAL: "natural",
    });
    export type SubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

    export interface Logic extends SohlLogic.Logic {
        readonly [kPhilosophy]: true;
        readonly parent: Philosophy.Data;
    }

    export interface Data extends SubTypeMixin.Data<SubType> {
        readonly [kData]: true;
        get logic(): SubTypeMixin.Logic<SubType>;
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: Philosophy.SubType,
        ): obj is Data {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kData in obj &&
                (subType ? (obj as Data).subType === subType : true)
            );
        }
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        Philosophy.SubType,
        typeof Philosophy.SubTypes
    >(
        SohlItem.DataModel,
        Philosophy.SubTypes,
    ) as unknown as Constructor<Philosophy.Data> &
        SohlDataModel.TypeDataModelStatics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            ctor: DataModel,
            logicClass: Philosophy,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
            subTypes: SubTypes,
        }),
    )
    export class DataModel extends DataModelShape {
        declare subType: SubType;
        static override readonly LOCALIZATION_PREFIXES = ["Philosophy"];
        readonly [kData] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/philosophy.hbs",
                },
            });
    }
}
