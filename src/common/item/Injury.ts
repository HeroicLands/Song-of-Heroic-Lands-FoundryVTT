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

import { InjuryData } from "@common/item/datamodel";
import { PerformerClassRegistryElement, SohlPerformer } from "@common";
import { CONTEXTMENU_SORT_GROUP, SohlContextMenuEntry } from "@utils";
import { RegisterClass } from "@utils/decorators";

export const INJURY_INTRINSIC_ACTIONS: StrictObject<SohlContextMenuEntry> = {
    TREATMENTTEST: {
        id: "treatment",
        functionName: "treatmentTest",
        name: "Treatment Test",
        iconClass: "fas fa-staff-snake",
        condition: (header: HTMLElement) => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (item?.system.isBleeding) return false;
            // const physician = item?.actor?.getSkillByAbbrev("pysn");
            // return physician && !physician.system.$masteryLevel.disabled;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        id: "healing",
        functionName: "healingTest",
        name: "Healing Test",
        iconClass: "fas fa-heart-pulse",
        condition: (header: HTMLElement) => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (item?.system.isBleeding) return false;
            // const endurance = item?.actor?.getTraitByAbbrev("end");
            // return endurance && !endurance.system.$masteryLevel.disabled;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
};

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "InjuryPerformer",
        defaultAction: INJURY_INTRINSIC_ACTIONS.HEALINGTEST.id,
        intrinsicActions: Object.values(INJURY_INTRINSIC_ACTIONS),
    }),
)
export class InjuryPerformer extends SohlPerformer<InjuryData> {
    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {}
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
import { InjuryPerformer } from "@common/item/performer";
import { SohlItemData, SohlItemDataModel } from "@common/item/datamodel";
import { ASPECT, AspectType } from "@common/modifier";
import { RegisterClass } from "@utils/decorators";
import { DataModelClassRegistryElement } from "@common/SohlBaseDataModel";
import { defineType, isOfType } from "@utils";
const { NumberField, BooleanField, StringField } = (foundry.data as any).fields;

export const INJURY_TYPE = "injury" as const;
export const isInjuryData = (obj: any): obj is InjuryData =>
    isOfType(obj, INJURY_TYPE);

export const {
    kind: SHOCK,
    values: Shock,
    isValue: isShock,
} = defineType({
    NONE: 0,
    STUNNED: 1,
    INCAPACITATED: 2,
    UNCONCIOUS: 3,
    KILLED: 4,
});
export type Shock = (typeof SHOCK)[keyof typeof SHOCK];

export const UNTREATED = {
    hr: 4,
    infect: true,
    impair: false,
    bleed: false,
    newInj: -1,
} as const;

export const INJURY_LEVELS = ["NA", "M1", "S2", "S3", "G4", "G5"];

export interface InjuryData extends SohlItemData<InjuryPerformer> {
    injuryLevelBase: number;
    healingRateBase: number;
    aspect: AspectType;
    isTreated: boolean;
    isBleeding: boolean;
    bodyLocationId: string;
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: INJURY_TYPE,
        logicClass: InjuryPerformer,
        iconCssClass: "fas fa-user-injured",
        img: "systems/sohl/assets/icons/injury.svg",
        sheet: "systems/sohl/templates/item/injury-sheet.hbs",
        schemaVersion: "0.6.0",
    }),
)
export class InjuryDataModel
    extends SohlItemDataModel<InjuryPerformer>
    implements InjuryData
{
    static override readonly LOCALIZATION_PREFIXES = ["INJURY"];
    static override readonly _metadata = {
        ...SohlItemDataModel._metadata,
    } as const;
    protected static readonly logicClass = InjuryPerformer;
    declare readonly parent: SohlItem<InjuryPerformer>;
    injuryLevelBase!: number;
    healingRateBase!: number;
    aspect!: AspectType;
    isTreated!: boolean;
    isBleeding!: boolean;
    bodyLocationId!: string;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            injuryLevelBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            healingRateBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            aspect: new StringField({
                initial: ASPECT.BLUNT,
                choices: Object.values(ASPECT),
            }),
            isTreated: new BooleanField({ initial: false }),
            isBleeding: new BooleanField({ initial: false }),
            bodyLocationId: new StringField(),
        };
    }
}
