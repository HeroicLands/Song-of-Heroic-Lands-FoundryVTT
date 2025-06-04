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

import { MysticalDeviceData } from "@common/item/datamodel";
import { PerformerClassRegistryElement, SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";
import { SubTypePerformer } from "./SubTypePerformer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "MysticalDevicePerformer",
    }),
)
export class MysticalDevicePerformer extends SubTypePerformer<MysticalDeviceData> {
    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {
        super.initialize(options);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {
        super.evaluate(options);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {
        super.finalize(options);
    }
}
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

import { SohlItem } from "@common/item";
import { MysticalDevicePerformer } from "@common/item/performer";
import { SubTypeData, SubTypeDataModel } from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { defineType, isOfType } from "@utils";
const { NumberField, StringField, BooleanField, SchemaField } = (
    foundry.data as any
).fields;

export const MYSTICALDEVICE_TYPE = "mysticaldevice" as const;
export const isMysticalDeviceData = (obj: any): obj is MysticalDeviceData =>
    isOfType(obj, MYSTICALDEVICE_TYPE);

export const {
    kind: MYSTICALDEVICE_SUBTYPE,
    values: MysticalDeviceSubTypes,
    isValue: isMysticalDeviceSubType,
} = defineType({
    ARTIFACT: "artifact",
    ANCESTOR_TALISMAN: "ancestortalisman",
    TOTEM_TALISMAN: "totemtalisman",
    REMNANT: "remnant",
    RELIC: "relic",
});
export type MysticalDeviceSubType =
    (typeof MYSTICALDEVICE_SUBTYPE)[keyof typeof MYSTICALDEVICE_SUBTYPE];

export interface MysticalDeviceData
    extends SubTypeData<MysticalDevicePerformer> {
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

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: MYSTICALDEVICE_TYPE,
        logicClass: MysticalDevicePerformer,
        iconCssClass: "fas fa-wand-sparkles",
        img: "systems/sohl/assets/icons/magic-wand.svg",
        sheet: "systems/sohl/templates/item/mysticaldevice-sheet.hbs",
        schemaVersion: "0.6.0",
        subTypes: Object.values(MYSTICALDEVICE_SUBTYPE),
    }),
)
export class MysticalDeviceDataModel
    extends SubTypeDataModel<MysticalDevicePerformer>
    implements MysticalDeviceData
{
    static override readonly LOCALIZATION_PREFIXES = ["AFFILIATION"];
    declare readonly parent: SohlItem<MysticalDevicePerformer>;
    config!: {
        requiresAttunement: boolean;
        usesVolition: boolean;
        assocPhilosophy: string;
    };
    domain!: string;
    isAttuned!: boolean;
    volition!: {
        ego: number;
        morality: number;
        purpose: string;
    };

    static defineSchema() {
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
