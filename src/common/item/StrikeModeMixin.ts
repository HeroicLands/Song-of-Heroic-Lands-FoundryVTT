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
import { SohlPerformer, SohlVariant } from "@common";
import { SohlAction } from "@common/event";
import { SohlItem, SubTypeMixin } from "@common/item";
import { ASPECT, AspectType } from "@common/modifier";
import { SohlActor } from "@common/actor";
import { HTMLString, DocumentId } from "@utils";
const { StringField, NumberField, SchemaField } = (foundry.data as any).fields;
const kStrikeModeMixin = Symbol("StrikeModeMixin");
const kDataModelMixin = Symbol("StrikeModeMixin.DataModel");

export function StrikeModeMixin<TBase extends AnyConstructor<SohlPerformer>>(
    Base: TBase,
): TBase {
    return class InternalStrikeModePerformer extends Base {
        readonly [kStrikeModeMixin] = true;

        static isA(obj: unknown): obj is TBase {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kStrikeModeMixin in obj
            );
        }

        /** @inheritdoc */
        initialize(context: SohlAction.Context = {}): void {
            super.initialize(context);
        }

        /** @inheritdoc */
        evaluate(context: SohlAction.Context = {}): void {
            super.evaluate(context);
        }

        /** @inheritdoc */
        finalize(context: SohlAction.Context = {}): void {
            super.finalize(context);
        }
    };
}

export namespace StrikeModeMixin {
    export const Kind = "strikemode";

    export interface Data<TPerformer extends SohlPerformer = SohlPerformer>
        extends SubTypeMixin.Data<TPerformer, SohlVariant> {
        mode: string;
        minParts: number;
        assocSkillName: string;
        impactBase: {
            numDice: number;
            die: number;
            modifier: number;
            aspect: AspectType;
        };
    }

    export type DataModelConstructor<
        TPerformer extends SohlPerformer = SohlPerformer,
    > = SohlItem.DataModelConstructor<TPerformer>;

    export function DataModelMixin<
        TBase extends AnyConstructor,
        TPerformer extends SohlPerformer = SohlPerformer,
    >(Base: TBase): TBase & Data<TPerformer> {
        return class InternalDataModel
            extends Base
            implements Data<TPerformer>
        {
            declare subType: SohlVariant;
            declare notes: HTMLString;
            declare description: HTMLString;
            declare textReference: HTMLString;
            declare transfer: boolean;
            declare nestedIn: DocumentId | null;
            declare parent:
                | SohlItem<SohlPerformer<SohlPerformer.Data>, any>
                | SohlActor<SohlPerformer<SohlPerformer.Data>, any>;
            declare logic: SohlPerformer<any>;
            declare actionList: PlainObject[];
            declare eventList: PlainObject[];
            declare mode: string;
            declare minParts: number;
            declare assocSkillName: string;
            declare impactBase: {
                numDice: number;
                die: number;
                modifier: number;
                aspect: AspectType;
            };
            readonly [kDataModelMixin] = true;

            static isA(obj: unknown): obj is TBase & Data<TPerformer> {
                return (
                    typeof obj === "object" &&
                    obj !== null &&
                    kDataModelMixin in obj
                );
            }

            static defineSchema() {
                return {
                    ...super.defineSchema(),
                    mode: new StringField(),
                    minParts: new NumberField({
                        integer: true,
                        initial: 1,
                        min: 0,
                    }),
                    assocSkillName: new StringField(),
                    impactBase: new SchemaField({
                        numDice: new NumberField({
                            integer: true,
                            initial: 0,
                            min: 0,
                        }),
                        die: new NumberField({
                            integer: true,
                            initial: 6,
                            min: 0,
                        }),
                        modifier: new NumberField({
                            integer: true,
                            initial: 0,
                        }),
                        aspect: new StringField({
                            initial: ASPECT.BLUNT,
                            required: true,
                            choices: Object.values(ASPECT),
                        }),
                    }),
                };
            }
        } as unknown as TBase & Data<TPerformer>;
    }
}
