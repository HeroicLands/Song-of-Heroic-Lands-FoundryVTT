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

import {
    defineType,
    IMPACT_ASPECT,
    ImpactAspect,
    ImpactAspects,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@utils/constants";
import type { SohlEventContext } from "@common/event/SohlEventContext";

import { SohlLogic } from "@common/SohlLogic";
import { SohlItem } from "@common/item/SohlItem";
import { SohlIntrinsicAction } from "@common/event/SohlIntrinsicAction";
import { toDocumentId } from "@utils/helpers";
import type { SohlAction } from "@common/event/SohlAction";
const { NumberField, BooleanField, StringField, DocumentIdField } =
    foundry.data.fields;
const kInjury = Symbol("Injury");
const kData = Symbol("Injury.Data");

export const {
    kind: INTRINSIC_ACTION,
    values: IntrinsicActions,
    isValue: isIntrinsicAction,
    labels: IntrinsicActionLabels,
} = defineType("SOHL.Injury.INTRINSIC_ACTION", {
    TREATMENTTEST: {
        id: toDocumentId("xdaddG1n1zCv2csz"),
        label: "SOHL.Injury.INTRINSIC_ACTION.TREATMENTTEST",
        functionName: "treatmentTest",
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
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        id: toDocumentId("IRgKV04alJdTzFVp"),
        label: "SOHL.Injury.INTRINSIC_ACTION.HEALINGTEST",
        functionName: "healingTest",
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
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
        foo: "",
    },
} as StrictObject<Partial<SohlIntrinsicAction.Data>>);
export type IntrinsicAction =
    (typeof INTRINSIC_ACTION)[keyof typeof INTRINSIC_ACTION];

export class Injury extends SohlItem.BaseLogic implements Injury.Logic {
    declare readonly _parent: Injury.Data;
    readonly [kInjury] = true;

    static isA(obj: unknown): obj is Injury {
        return typeof obj === "object" && obj !== null && kInjury in obj;
    }

    get intrinsicActions(): SohlAction[] {
        const actionKeys = new Set<string>();
        const actions: SohlAction[] = Object.keys(INTRINSIC_ACTION).map(
            (key) => {
                const data = INTRINSIC_ACTION[key];
                data.label ??= IntrinsicActionLabels[key];
                actionKeys.add(data.label);
                return new SohlIntrinsicAction(this, data);
            },
        );

        return super.intrinsicActions.reduce((acc, action) => {
            if (!actionKeys.has(action.label)) {
                actionKeys.add(action.label);
                acc.push(action);
            }
            return acc;
        }, actions);
    }

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

export namespace Injury {
    export const {
        kind: SHOCK,
        values: Shock,
        isValue: isShock,
    } = defineType("SOHL.Injury.SHOCK", {
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
        bleed: false,
        impair: false,
        newInj: -1,
    } as const;

    export const INJURY_LEVELS = ["NA", "M1", "S2", "S3", "G4", "G5"];

    export interface Logic extends SohlLogic {
        readonly _parent: Injury.Data;
        readonly [kInjury]: true;
    }

    export interface Data extends SohlItem.Data {
        readonly [kData]: true;
        injuryLevelBase: number;
        healingRateBase: number;
        aspect: ImpactAspect;
        isTreated: boolean;
        isBleeding: boolean;
        bodyLocationId: string;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export class DataModel extends SohlItem.DataModel.Shape implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["INJURY"];
        injuryLevelBase!: number;
        healingRateBase!: number;
        aspect!: ImpactAspect;
        isTreated!: boolean;
        isBleeding!: boolean;
        bodyLocationId!: string;
        readonly [kData] = true;

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
                    initial: IMPACT_ASPECT.BLUNT,
                    choices: ImpactAspects,
                }),
                isTreated: new BooleanField({ initial: false }),
                isBleeding: new BooleanField({ initial: false }),
                bodyLocationId: new DocumentIdField(),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/injury.hbs",
                },
            });
    }
}
