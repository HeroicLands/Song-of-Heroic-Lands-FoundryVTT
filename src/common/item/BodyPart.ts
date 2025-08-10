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

import { SohlLogic } from "@common/SohlLogic";
import { SohlItem } from "@common/item/SohlItem";
import type { SohlAction } from "@common/event/SohlAction";
const kBodyPart = Symbol("BodyPart");
const kData = Symbol("BodyPart.Data");

const { BooleanField, StringField, DocumentIdField } = foundry.data.fields;

export class BodyPart extends SohlLogic implements BodyPart.Logic {
    declare readonly parent: BodyPart.Data;
    readonly [kBodyPart] = true;

    static isA(obj: unknown): obj is BodyPart {
        return typeof obj === "object" && obj !== null && kBodyPart in obj;
    }

    get bodyLocations(): SohlItem[] {
        return this.actor?.itemTypes.bodylocation || [];
    }

    get heldItem(): SohlItem | null {
        return (
            (this.parent.heldItemId &&
                this.item?.actor?.items.get(this.parent.heldItemId)) ||
            null
        );
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace BodyPart {
    export interface Logic extends SohlLogic.Logic {
        readonly parent: BodyPart.Data;
        readonly [kBodyPart]: true;
    }

    export interface Data extends SohlItem.Data {
        readonly [kData]: true;
        readonly logic: Logic;
        abbrev: string;
        canHoldItem: boolean;
        heldItemId: string | null;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export class DataModel extends SohlItem.DataModel implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["BodyPart"];
        declare readonly parent: SohlItem<BodyPart>;
        declare _logic: Logic;
        abbrev!: string;
        canHoldItem!: boolean;
        heldItemId!: string | null;
        readonly [kData] = true;

        get logic(): Logic {
            this._logic ??= new BodyPart(this);
            return this._logic;
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
