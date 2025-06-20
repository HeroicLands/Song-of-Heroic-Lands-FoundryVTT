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
import { RegisterClass } from "@utils/decorators";
import { SubTypeMixin } from "./SubTypeMixin";
import { SohlAction } from "@common/event";
import { defineType } from "@utils";
import { SohlItem } from ".";

const { NumberField, StringField, BooleanField, SchemaField } =
    foundry.data.fields;
const kMysticalDevice = Symbol("MysticalDevice");
const kData = Symbol("MysticalDevice.Data");

@RegisterClass(
    new SohlLogic.Element({
        kind: "MysticalDevice",
    }),
)
export class MysticalDevice
    extends SubTypeMixin(SohlLogic)
    implements MysticalDevice.Logic
{
    declare readonly parent: MysticalDevice.Data;
    readonly [kMysticalDevice] = true;

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

export namespace MysticalDevice {
    /**
     * The type moniker for the Affliction item.
     */
    export const Kind = "mysticaldevice";

    /**
     * The FontAwesome icon class for the Affliction item.
     */
    export const IconCssClass = "fas fa-wand-sparkles";

    /**
     * The image path for the Affliction item.
     */
    export const Image = "systems/sohl/assets/icons/magic-wand.svg";

    export const {
        kind: SUBTYPE,
        values: SubTypes,
        isValue: isSubType,
    } = defineType("SOHL.MysticalDevice.SubType", {
        ARTIFACT: "artifact",
        ANCESTOR_TALISMAN: "ancestortalisman",
        TOTEM_TALISMAN: "totemtalisman",
        REMNANT: "remnant",
        RELIC: "relic",
    });
    export type SubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

    export interface Logic extends SohlLogic.Logic {
        readonly parent: MysticalDevice.Data;
        readonly [kMysticalDevice]: true;
    }

    export interface Data extends SubTypeMixin.Data<SubType> {
        readonly [kData]: true;
        get logic(): SubTypeMixin.Logic<SubType>;
        config: {
            requiresAttunement: boolean;
            usesVolition: boolean;
            assocPhilosophy: string;
        };
        domain: string;
        isAttuned: boolean;
        volition: {
            ego: number;
            morality: number;
            purpose: string;
        };
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: MysticalDevice.SubType,
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
        MysticalDevice.SubType,
        typeof MysticalDevice.SubTypes
    >(
        SohlItem.DataModel,
        MysticalDevice.SubTypes,
    ) as unknown as Constructor<MysticalDevice.Data> &
        SohlDataModel.TypeDataModelStatics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: MysticalDevice,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
            subTypes: SubTypes,
        }),
    )
    export class DataModel extends DataModelShape {
        readonly [kData] = true;
        static override readonly LOCALIZATION_PREFIXES = ["MysticalDevice"];
        declare subType: SubType;
        declare config: {
            requiresAttunement: boolean;
            usesVolition: boolean;
            assocPhilosophy: string;
        };
        declare domain: string;
        declare isAttuned: boolean;
        declare volition: {
            ego: number;
            morality: number;
            purpose: string;
        };

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        get logic(): SubTypeMixin.Logic<SubType> {
            return super.logic as SubTypeMixin.Logic<SubType>;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                config: new SchemaField({
                    requiresAttunement: new BooleanField({ initial: false }),
                    usesVolition: new BooleanField({ initial: false }),
                    assocPhilosophy: new StringField(),
                }),
                domain: new StringField(),
                isAttuned: new BooleanField({ initial: false }),
                volition: new SchemaField({
                    ego: new NumberField({
                        integer: true,
                        initial: 0,
                        min: 0,
                    }),
                    morality: new NumberField({
                        integer: true,
                        initial: 0,
                        min: 0,
                    }),
                    purpose: new StringField(),
                }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/mysticaldevice.hbs",
                },
            });
    }
}
