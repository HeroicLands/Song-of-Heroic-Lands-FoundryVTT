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
import { SohlAction } from "@common/event";
import { ImpactModifier } from "@common/modifier";
import { SohlLogic } from "@common/SohlLogic";
import { SohlContextMenu, defineType } from "@utils";
import { RegisterClass } from "@utils/decorators";
import { SohlItem } from "./SohlItem";
import { SohlDataModel } from "@common";
const { NumberField, BooleanField, StringField, DocumentIdField } = (
    foundry.data as any
).fields;
const kInjury = Symbol("Injury");
const kDataModel = Symbol("Injury.DataModel");

@RegisterClass(
    new SohlLogic.Element({
        kind: "InjuryLogic",
        defaultAction: Injury.INTRINSIC_ACTION.HEALINGTEST.id,
        intrinsicActions: Injury.IntrinsicActions,
    }),
)
export class Injury<TData extends Injury.Data = Injury.Data>
    extends SohlLogic
    implements Injury.Logic
{
    declare readonly parent: TData;
    readonly [kInjury] = true;

    static isA(obj: unknown): obj is Injury {
        return typeof obj === "object" && obj !== null && kInjury in obj;
    }
    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace Injury {
    /**
     * The type moniker for the Injury item.
     */
    export const Kind = "injury";

    /**
     * The FontAwesome icon class for the Injury item.
     */
    export const IconCssClass = "fas fa-user-injured";

    /**
     * The image path for the Injury item.
     */
    export const Image = "systems/sohl/assets/icons/injury.svg";

    export const {
        kind: INTRINSIC_ACTION,
        values: IntrinsicActions,
        isValue: isIntrinsicAction,
    } = defineType("SOHL.Injury.IntrinsicActions", {
        TREATMENTTEST: new SohlContextMenu.Entry({
            id: "treatment",
            functionName: "treatmentTest",
            name: "Treatment Test",
            iconFAClass: "fas fa-staff-snake",
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
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        }),
        HEALINGTEST: new SohlContextMenu.Entry({
            id: "healing",
            functionName: "healingTest",
            name: "Healing Test",
            iconFAClass: "fas fa-heart-pulse",
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
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        }),
    } as StrictObject<SohlContextMenu.Entry>);
    export type IntrinsicAction =
        (typeof INTRINSIC_ACTION)[keyof typeof INTRINSIC_ACTION];

    export const {
        kind: SHOCK,
        values: Shock,
        isValue: isShock,
    } = defineType("SOHL.Injury.Shock", {
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

    export interface Logic extends SohlLogic.Logic {}

    export interface Data extends SohlItem.Data {
        injuryLevelBase: number;
        healingRateBase: number;
        aspect: ImpactModifier.AspectType;
        isTreated: boolean;
        isBleeding: boolean;
        bodyLocationId: string;
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: Injury,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel extends SohlItem.DataModel implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["INJURY"];
        injuryLevelBase!: number;
        healingRateBase!: number;
        aspect!: ImpactModifier.AspectType;
        isTreated!: boolean;
        isBleeding!: boolean;
        bodyLocationId!: string;
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
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
                    initial: ImpactModifier.ASPECT.BLUNT,
                    choices: ImpactModifier.Aspects,
                }),
                isTreated: new BooleanField({ initial: false }),
                isBleeding: new BooleanField({ initial: false }),
                bodyLocationId: new DocumentIdField(),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/injury.hbs",
                },
            });
    }
}
