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

import type { SohlEventContext } from "@common/event/SohlEventContext";

import { SohlItem } from "@common/item/SohlItem";
const { BooleanField, StringField } = foundry.data.fields;
const kBodyLocation = Symbol("BodyLocation");
const kData = Symbol("BodyLocation.Data");

export class BodyLocation
    extends SohlItem.BaseLogic
    implements BodyLocation.Logic
{
    declare readonly _parent: BodyLocation.Data;
    protection!: PlainObject;
    layers!: string;
    traits!: PlainObject;
    readonly [kBodyLocation] = true;

    static isA(obj: unknown): obj is BodyLocation {
        return typeof obj === "object" && obj !== null && kBodyLocation in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        this.protection = {};
        this.layers = "";
        this.traits = {
            isRigid: false,
        };
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

export namespace BodyLocation {
    export interface Logic extends SohlItem.Logic {
        readonly _parent: Data;
        readonly [kBodyLocation]: true;
    }

    export interface Data extends SohlItem.Data {
        readonly [kData]: true;
        abbrev: string;
        isFumble: boolean;
        isStumble: boolean;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export class DataModel extends SohlItem.DataModel.Shape implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["BodyLocation"];
        readonly [kData] = true;
        abbrev!: string;
        isFumble!: boolean;
        isStumble!: boolean;

        static override create<Logic>(
            data: PlainObject,
            options: PlainObject,
        ): Logic {
            if (!(options.parent instanceof SohlItem)) {
                throw new Error("Parent must be a SohlItem");
            }
            return new BodyLocation(data, { parent: options.parent }) as Logic;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                abbrev: new StringField(),
                isFumble: new BooleanField({ initial: false }),
                isStumble: new BooleanField({ initial: false }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/bodylocation.hbs",
                },
            });
    }
}
