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

const kBodyPart = Symbol("BodyPart");
const kData = Symbol("BodyPart.Data");

const { BooleanField, StringField, DocumentIdField } = foundry.data.fields;

export class BodyPart extends SohlItem.BaseLogic implements BodyPart.Logic {
    declare readonly _parent: BodyPart.Data;
    readonly [kBodyPart] = true;

    static isA(obj: unknown): obj is BodyPart {
        return typeof obj === "object" && obj !== null && kBodyPart in obj;
    }

    get bodyLocations(): SohlItem[] {
        return this.actor?.allItemTypes.bodylocation || [];
    }

    get heldItem(): SohlItem | null {
        return (
            (this._parent.heldItemId &&
                this.item?.actor?.allItems.get(this._parent.heldItemId)) ||
            null
        );
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

export namespace BodyPart {
    export interface Logic extends SohlItem.Logic {
        readonly _parent: BodyPart.Data;
        readonly [kBodyPart]: true;
    }

    export interface Data extends SohlItem.Data {
        readonly [kData]: true;
        abbrev: string;
        canHoldItem: boolean;
        heldItemId: string | null;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export class DataModel extends SohlItem.DataModel.Shape implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["BodyPart"];
        readonly [kData] = true;
        abbrev!: string;
        canHoldItem!: boolean;
        heldItemId!: string | null;

        static override create<Logic>(
            data: PlainObject,
            options: PlainObject,
        ): Logic {
            if (!(options.parent instanceof SohlItem)) {
                throw new Error("Parent must be a SohlItem");
            }
            return new BodyPart(data, { parent: options.parent }) as Logic;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                abbrev: new StringField(),
                canHoldItem: new BooleanField({ initial: false }),
                heldItemId: new DocumentIdField({ nullable: true }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS = {
            header: {
                template: "systems/sohl/templates/item/bodypart.hbs",
            },
        };
    }
}
