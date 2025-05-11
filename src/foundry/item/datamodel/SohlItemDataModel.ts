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

import { SohlPerformer } from "../../../logic/common/core/SohlPerformer.js";
import { SohlBaseDataModel } from "@foundry/SohlBaseDataModel.js";
import { SohlItemProxy } from "@logic/common/item";
import { SohlPerformerItemData } from "@logic/common/item/data";
import { SohlActorProxy } from "@logic/common/actor";
const { SchemaField, ArrayField, ObjectField, ForeignDocumentField } = (
    foundry.data as any
).fields;

/**
 * The `SohlItemDataModel` class extends the Foundry VTT `TypeDataModel` to provide
 * a structured data model for items in the "Song of Heroic Lands" module. It
 * encapsulates logic and behavior associated with items, offering a schema
 * definition and initialization logic.
 */
export abstract class SohlItemDataModel<P extends SohlPerformer = SohlPerformer>
    extends SohlBaseDataModel
    implements SohlPerformerItemData
{
    declare parent: SohlItemProxy;
    notes!: string;
    description!: string;
    textReference!: string;
    transfer!: boolean;
    protected _logic!: P;
    nestedIn!: string | null;

    protected static logicClass: new (
        parent: any,
        data?: PlainObject,
        options?: PlainObject,
    ) => SohlPerformer;

    get logic(): P {
        const ctor = (this.constructor as typeof SohlItemDataModel).logicClass;
        // @ts-expect-error: TypeScript doesn't realize that this._logic is a SohlPerformer
        return (this._logic ??= new ctor(this)) as P;
    }

    get item(): SohlItemProxy {
        return this.parent;
    }

    get actor(): SohlActorProxy | null {
        return this.item.actor;
    }

    get sheet(): string {
        return `systems/sohl/templates/item/${this.item.type}-sheet.hbs`;
    }

    /** @override */
    static defineSchema(): typeof SchemaField {
        return {
            nestedIn: new ForeignDocumentField({
                types: ["Item"],
                nullable: true,
                initial: null,
            }),
        };
    }
}
