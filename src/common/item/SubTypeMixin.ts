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

import { SohlItem } from "@common/item/SohlItem";
import type { SohlEventContext } from "@common/event/SohlEventContext";

export const kSubTypeMixin = Symbol("SubTypeMixin");
export const kSubTypeMixinData = Symbol("SubType.Data");

export function SubTypeMixin<TBase extends AnyConstructor<SohlItem.BaseLogic>>(
    Base: TBase,
): TBase & Constructor<InstanceType<TBase> & SubTypeMixin.Logic> {
    return class extends Base {
        declare setDefaultAction: () => void;
        readonly [kSubTypeMixin] = true;

        /** @inheritdoc */
        initialize(context: SohlEventContext): void {
            super.initialize(context);
        }

        /** @inheritdoc */
        evaluate(context: SohlEventContext): void {
            super.evaluate(context);
        }

        /** @inheritdoc */
        finalize(context: SohlEventContext): void {
            super.finalize(context);
        }
    } as unknown as TBase &
        Constructor<InstanceType<TBase> & SubTypeMixin.Logic>;
}

export namespace SubTypeMixin {
    export function isA(obj: unknown): obj is Logic {
        return typeof obj === "object" && obj !== null && kSubTypeMixin in obj;
    }

    export interface Logic<TSubType extends string = string>
        extends SohlItem.Logic {
        readonly _parent: Data<TSubType>;
    }

    export interface Data<TSubType extends string = string>
        extends SohlItem.Data {
        readonly [kSubTypeMixinData]: true;
        subType: TSubType;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kSubTypeMixinData in obj
            );
        }
    }

    /**
     * A mixin for item data models that have a subtype.
     * This mixin adds a `subType` property to the item data model, which is a string
     * that represents the subtype of the item.
     *
     * @template TBase The base class to mix into.
     * @template TSubType The subtype string type (union of strings).
     * @template TChoices An array type of `TSubType` strings.
     * @template TLogic The performer type, defaulting to `SohlLogic`.
     * @param Base Base class to extend (should be a `TypeDataModel` subclass).
     * @param choices Allowed choices for the `subType` property, which must be a
     *                 readonly array of `TSubType` strings.
     * @returns The extended class with the `subType` property and choices.
     */
    export function DataModel<
        TBase extends AbstractConstructor<SohlItem.DataModel> &
            SohlItem.DataModel.Statics,
        TSubType extends string,
        TChoices extends readonly TSubType[],
    >(
        Base: TBase,
        choices: TChoices,
    ): TBase &
        AbstractConstructor<InstanceType<TBase> & Data<TSubType>> &
        SohlItem.DataModel.Statics & { readonly choices: TChoices } {
        abstract class DM extends Base {
            declare subType: TSubType;
            readonly [kSubTypeMixinData] = true;

            constructor(...args: any[]) {
                super(...args);
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
        }

        return DM as unknown as TBase &
            AbstractConstructor<InstanceType<TBase> & Data<TSubType>> &
            SohlItem.DataModel.Statics & { readonly choices: TChoices };
    }
}
