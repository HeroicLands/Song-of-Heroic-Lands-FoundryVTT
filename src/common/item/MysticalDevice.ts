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

import type { SohlLogic } from "@common/SohlLogic";
import { SohlItem } from "@common/item/SohlItem";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import type { SohlEventContext } from "@common/event/SohlEventContext";

import {
    MysticalDeviceSubType,
    MysticalDeviceSubTypes,
} from "@utils/constants";

const { NumberField, StringField, BooleanField, SchemaField } =
    foundry.data.fields;
const kMysticalDevice = Symbol("MysticalDevice");
const kData = Symbol("MysticalDevice.Data");

export class MysticalDevice
    extends SubTypeMixin(SohlItem.BaseLogic)
    implements MysticalDevice.Logic
{
    declare readonly _parent: MysticalDevice.Data;
    readonly [kMysticalDevice] = true;

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace MysticalDevice {
    export interface Logic extends SohlLogic {
        readonly _parent: MysticalDevice.Data;
        readonly [kMysticalDevice]: true;
    }

    export interface Data extends SubTypeMixin.Data<MysticalDeviceSubType> {
        readonly [kData]: true;
        requiresAttunement: boolean;
        usesVolition: boolean;
        domain: {
            philosophy: string;
            name: string;
        };
        isAttuned: boolean;
        volition: {
            ego: number;
            morality: number;
            purpose: string;
        };
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        MysticalDeviceSubType,
        typeof MysticalDeviceSubTypes
    >(
        SohlItem.DataModel,
        MysticalDeviceSubTypes,
    ) as unknown as Constructor<MysticalDevice.Data> &
        SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape {
        static override readonly LOCALIZATION_PREFIXES = ["MysticalDevice"];
        declare subType: MysticalDeviceSubType;
        declare requiresAttunement: boolean;
        declare usesVolition: boolean;
        declare domain: {
            philosophy: string;
            name: string;
        };
        declare isAttuned: boolean;
        declare volition: {
            ego: number;
            morality: number;
            purpose: string;
        };
        readonly [kData] = true;

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                requiresAttunement: new BooleanField({ initial: false }),
                usesVolition: new BooleanField({ initial: false }),
                domain: new SchemaField({
                    philosophy: new StringField(),
                    name: new StringField(),
                }),
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
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/mysticaldevice.hbs",
                },
            });
    }
}
