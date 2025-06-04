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

import { ProjectileGearData } from "@common/item/datamodel";
import { PerformerClassRegistryElement, SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";
import { GearPerformer } from "./GearPerformer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "ProjectileGearPerformer",
    }),
)
export class ProjectileGearPerformer extends GearPerformer<ProjectileGearData> {
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
import { ProjectileGearPerformer } from "@common/item/performer";
import { GearData, GearDataModel, SubTypeData } from "@common/item/datamodel";
import { ASPECT } from "@common/modifier";
import { DataModelClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { defineType, isOfType } from "@utils";
const { SchemaField, NumberField, StringField } = (foundry.data as any).fields;

export const PROJECTILEGEAR_TYPE = "projectilegear" as const;
export const isProjectileGearData = (obj: any): obj is ProjectileGearData =>
    isOfType(obj, PROJECTILEGEAR_TYPE);

export const {
    kind: PROJECTILEGEAR_SUBTYPE,
    values: ProjectileGearSubTypes,
    isValue: isProjectileGearSubType,
} = defineType({
    NONE: "none",
    ARROW: "arrow",
    BOLT: "bolt",
    BULLET: "bullet",
    DART: "dart",
    OTHER: "other",
});
export type ProjectileGearSubType =
    (typeof PROJECTILEGEAR_SUBTYPE)[keyof typeof PROJECTILEGEAR_SUBTYPE];

export interface ProjectileGearData
    extends GearData<ProjectileGearPerformer>,
        SubTypeData<ProjectileGearPerformer, ProjectileGearSubType> {
    shortName: string;
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: string;
    };
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: PROJECTILEGEAR_TYPE,
        logicClass: ProjectileGearPerformer,
        iconCssClass: "fas fa-bow-arrow",
        img: "systems/sohl/assets/icons/arrow.svg",
        sheet: "systems/sohl/templates/item/projectilegear-sheet.hbs",
        schemaVersion: "0.6.0",
    }),
)
export class ProjectileGearDataModel
    extends GearDataModel<ProjectileGearPerformer>
    implements ProjectileGearData, SubTypeData
{
    static override readonly LOCALIZATION_PREFIXES = ["PROJECTILEGEAR"];
    declare readonly parent: SohlItem<ProjectileGearPerformer>;
    shortName!: string;
    impactBase!: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: string;
    };
    subType!: ProjectileGearSubType;

    get subTypeChoices(): string[] {
        return (this.constructor as any)._metadata.subTypes;
    }

    static defineSchema() {
        return {
            ...super.defineSchema(),
            kind: new StringField({
                initial: PROJECTILEGEAR_SUBTYPE.NONE,
                required: true,
                choices: Object.values(PROJECTILEGEAR_SUBTYPE),
            }),
            shortName: new StringField(),
            impactBase: new SchemaField({
                numDice: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                die: new NumberField({
                    integer: true,
                    initial: 6,
                    min: 1,
                }),
                modifier: new NumberField({
                    integer: true,
                    initial: -1,
                    min: -1,
                }),
                aspect: new StringField({
                    initial: ASPECT.BLUNT,
                    requried: true,
                    choices: Object.values(ASPECT),
                }),
            }),
        };
    }
}
