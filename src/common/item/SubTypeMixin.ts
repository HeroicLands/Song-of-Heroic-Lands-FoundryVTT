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
import { SohlPerformer } from "@common";
import { SohlAction } from "@common/event";
import { DocumentId, HTMLString } from "@utils";

const kSubTypeMixin = Symbol("SubTypeMixin");
const kDataModelMixin = Symbol("SubType.DataModelMixin");

export function SubTypeMixin<TBase extends AnyConstructor<SohlPerformer>>(
    Base: TBase,
): TBase {
    return class InternalSubTypePerformer extends Base {
        readonly [kSubTypeMixin] = true;

        static isA(obj: unknown): obj is TBase {
            return (
                typeof obj === "object" && obj !== null && kSubTypeMixin in obj
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

export namespace SubTypeMixin {
    export const Kind = "subtype";

    export interface Data<
        TPerformer extends SohlPerformer = SohlPerformer,
        TSubType extends string = string,
    > extends SohlItem.Data<TPerformer> {
        subType: TSubType;
    }

    export type DataModelConstructor<
        TPerformer extends SohlPerformer = SohlPerformer,
    > = SohlItem.DataModelConstructor<TPerformer>;

    /**
     * A mixin for item data models that have a subtype.
     * This mixin adds a `subType` property to the item data model, which is a string
     * that represents the subtype of the item.
     *
     * @template TBase The base class to mix into.
     * @template TSubType The subtype string type (union of strings).
     * @template TChoices An array type of `TSubType` strings.
     * @template TPerformer The performer type, defaulting to `SohlPerformer`.
     * @param Base Base class to extend (should be a `TypeDataModel` subclass).
     * @param choices Allowed choices for the `subType` property, which must be a
     *                 readonly array of `TSubType` strings.
     * @returns The extended class with the `subType` property and choices.
     */
    export function DataModel<
        TBase extends AnyConstructor,
        TSubType extends string,
        TChoices extends readonly TSubType[],
        TPerformer extends SohlPerformer = SohlPerformer,
    >(Base: TBase, choices: TChoices): TBase & Data<TPerformer, TSubType> {
        return class InternalDataModel
            extends Base
            implements Data<TPerformer, TSubType>
        {
            declare notes: HTMLString;
            declare description: HTMLString;
            declare textReference: HTMLString;
            declare transfer: boolean;
            declare nestedIn: DocumentId | null;
            declare parent: SohlItem;
            declare logic: SohlPerformer<any>;
            declare actionList: PlainObject[];
            declare eventList: PlainObject[];
            declare subType: TSubType;
            readonly [kDataModelMixin] = true;

            static isA(
                obj: unknown,
            ): obj is TBase & Data<TPerformer, TSubType> {
                return (
                    typeof obj === "object" &&
                    obj !== null &&
                    kDataModelMixin in obj
                );
            }

            static defineSchema(): foundry.data.fields.DataSchema {
                return {
                    ...super.defineSchema(),
                    subType: new foundry.data.fields.StringField({
                        choices,
                        required: true,
                    }),
                };
            }

            get choices(): TChoices {
                return choices;
            }
        } as unknown as TBase & Data<TPerformer, TSubType>;
    }
}
