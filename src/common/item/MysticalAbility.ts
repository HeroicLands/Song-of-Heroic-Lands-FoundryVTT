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

import { PerformerClassRegistryElement } from "@common";
import { MysticalAbilityData } from "@common/item/datamodel";
import { MasteryLevelPerformer } from "@common/item/performer";
import { RegisterClass } from "@utils/decorators";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "MysticalAbilityPerformer",
    }),
)
export class MysticalAbilityPerformer extends MasteryLevelPerformer<MysticalAbilityData> {}
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
import { MysticalAbilityPerformer } from "@common/item/performer";
import {
    MasteryLevelData,
    MasteryLevelDataModel,
} from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common/SohlBaseDataModel";
import { RegisterClass } from "@utils/decorators";
import { defineType, isOfType } from "@utils";
const { SchemaField, NumberField, StringField, BooleanField } = (
    foundry.data as any
).fields;

export const MYSTICALABILITY_TYPE = "mysticalability" as const;
export const isMysticalAbilityData = (obj: any): obj is MysticalAbilityData =>
    isOfType(obj, MYSTICALABILITY_TYPE);

export const {
    kind: MYSTICALABILITY_SUBTYPE,
    values: MysticalAbilitySubTypes,
    isValue: isMysticalAbilitySubType,
} = defineType({
    SHAMANICRITE: "shamanicrite",
    SPIRITACTION: "spiritaction",
    SPIRITPOWER: "spiritpower",
    BENEDICTION: "benediction",
    DIVINEDEVOTION: "divinedevotion",
    DIVINEINCANTATION: "divineincantation",
    ARCANEINCANTATION: "arcaneincantation",
    ARCANEINVOCATION: "arcaneinvocation",
    ARCANETALENT: "arcanetalent",
    ALCHEMY: "alchemy",
    DIVINATION: "divination",
});
export type MysticalAbilitySubType =
    (typeof MYSTICALABILITY_SUBTYPE)[keyof typeof MYSTICALABILITY_SUBTYPE];

export const DOMAIN_DEGREE = {
    PRIMARY: { name: "primary", value: 0 },
    SECONDARY: { name: "secondary", value: 1 },
    NEUTRAL: { name: "neutral", value: 2 },
    TERTIARY: { name: "tertiary", value: 3 },
    DIAMETRIC: { name: "diametric", value: 4 },
} as const;
export type DomainDegreeValue =
    (typeof DOMAIN_DEGREE)[keyof typeof DOMAIN_DEGREE];

export interface MysticalAbilityData
    extends MasteryLevelData<MysticalAbilityPerformer, MysticalAbilitySubType> {
    config: {
        usesCharges: boolean;
        usesSkills: boolean;
        assocPhilosophy: string;
        isImprovable: boolean;
        assocSkill: string;
        category: string;
    };
    domain: string;
    skills: string[];
    levelBase: number;
    charges: {
        value: number;
        max: number;
    };
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: MYSTICALABILITY_TYPE,
        logicClass: MysticalAbilityPerformer,
        iconCssClass: "fas fa-hand-sparkles",
        img: "systems/sohl/assets/icons/hand-sparkles.svg",
        sheet: "systems/sohl/templates/item/mysticalability-sheet.hbs",
        schemaVersion: "0.6.0",
    }),
)
export class MysticalAbilityDataModel
    extends MasteryLevelDataModel<
        MysticalAbilityPerformer,
        MysticalAbilitySubType
    >
    implements MysticalAbilityData
{
    static override readonly LOCALIZATION_PREFIXES = ["MYSTICALABILITY"];
    declare readonly parent: SohlItem<MysticalAbilityPerformer>;
    config!: {
        usesCharges: boolean;
        usesSkills: boolean;
        assocPhilosophy: string;
        isImprovable: boolean;
        assocSkill: string;
        category: string;
    };
    domain!: string;
    skills!: string[];
    levelBase!: number;
    charges!: {
        value: number;
        max: number;
    };

    static defineSchema() {
        return {
            ...super.defineSchema(),
            config: new SchemaField({
                isImprovable: new BooleanField({ initial: false }),
                assocSkill: new StringField(),
                category: new StringField(),
                assocPhilosophy: new StringField(),
                usesCharges: new BooleanField({ initial: false }),
            }),
            domain: new StringField(),
            levelBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            charges: new SchemaField({
                value: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                // Note: if max charges is 0, then there is no maximum
                max: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
            }),
        };
    }
}
