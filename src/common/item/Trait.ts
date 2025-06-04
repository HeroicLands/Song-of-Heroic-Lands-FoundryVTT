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

import { TraitData } from "@common/item/datamodel";
import { PerformerClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { MasteryLevelPerformer } from "@common/item/performer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "TraitPerformer",
    }),
)
export class TraitPerformer extends MasteryLevelPerformer<TraitData> {
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
import { TraitPerformer } from "@common/item/performer";
import {
    MasteryLevelData,
    MasteryLevelDataModel,
} from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { defineType, isOfType } from "@utils";
const {
    ArrayField,
    ObjectField,
    SchemaField,
    NumberField,
    StringField,
    BooleanField,
} = (foundry.data as any).fields;

export const TRAIT_TYPE = "trait" as const;
export const isTraitData = (obj: any): obj is TraitData =>
    isOfType(obj, TRAIT_TYPE);

export const {
    kind: TRAIT_SUBTYPE,
    values: TraitSubTypes,
    isValue: isTraitSubType,
} = defineType({
    PHYSIQUE: "physique",
    PERSONALITY: "personality",
    TRANSCENDENT: "transcendent",
});
export type TraitSubType = (typeof TRAIT_SUBTYPE)[keyof typeof TRAIT_SUBTYPE];

export const {
    kind: INTENSITY,
    values: TraitIntensities,
    isValue: isTraitIntensity,
} = defineType({
    TRAIT: "trait",
    IMPULSE: "impulse",
    DISORDER: "disorder",
    ATTRIBUTE: "attribute",
});
export type TraitIntensity = (typeof INTENSITY)[keyof typeof INTENSITY];

export interface TraitData
    extends MasteryLevelData<TraitPerformer, TraitSubType> {
    textValue: string;
    max: number | null;
    isNumeric: boolean;
    intensity: TraitIntensity;
    valueDesc: {
        label: string;
        maxValue: number;
    }[];
    choices: StrictObject<string>;
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: TRAIT_TYPE,
        logicClass: TraitPerformer,
        iconCssClass: "fas fa-user-gear",
        img: "systems/sohl/assets/icons/user-gear.svg",
        sheet: "systems/sohl/templates/item/trait-sheet.hbs",
        schemaVersion: "0.6.0",
        subTypes: Object.values(TRAIT_SUBTYPE),
    }),
)
export class TraitDataModel
    extends MasteryLevelDataModel<TraitPerformer, TraitSubType>
    implements TraitData
{
    static override readonly LOCALIZATION_PREFIXES = ["TRAIT"];
    declare readonly parent: SohlItem<TraitPerformer>;
    textValue!: string;
    max!: number | null;
    isNumeric!: boolean;
    intensity!: TraitIntensity;
    valueDesc!: {
        label: string;
        maxValue: number;
    }[];
    choices!: StrictObject<string>;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            textValue: new StringField(),
            max: new NumberField({
                integer: true,
                nullable: true,
                initial: null,
            }),
            isNumeric: new BooleanField({ initial: false }),
            intensity: new StringField({
                initial: INTENSITY.TRAIT,
                required: true,
                choices: Object.values(INTENSITY),
            }),
            valueDesc: new ArrayField(
                new SchemaField({
                    label: new StringField({
                        blank: false,
                        required: true,
                    }),
                    maxValue: new NumberField({
                        integer: true,
                        required: true,
                        initial: 0,
                    }),
                }),
            ),
            choices: new ObjectField(),
        };
    }
}
