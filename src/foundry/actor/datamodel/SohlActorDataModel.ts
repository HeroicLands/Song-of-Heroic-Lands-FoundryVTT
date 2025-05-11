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

import { SohlBaseDataModel } from "@foundry/SohlBaseDataModel";
import { SohlActorProxy } from "@logic/common/actor";
import { SohlPerformer } from "@logic/common/core";

const { HTMLField, FilePathField } = (foundry.data as any).fields;

export abstract class SohlActorDataModel<
    P extends SohlPerformer = SohlPerformer,
> extends SohlBaseDataModel {
    declare parent: SohlActorProxy;
    protected _logic!: P;

    protected static logicClass: new (
        parent: any,
        data?: PlainObject,
        options?: PlainObject,
    ) => SohlPerformer;

    get logic(): P {
        const ctor = (this.constructor as typeof SohlActorDataModel).logicClass;
        // @ts-expect-error: TypeScript doesn't realize that this._logic is a SohlPerformer
        return (this._logic ??= new ctor(this)) as P;
    }

    get actor(): SohlActorProxy {
        return this.parent;
    }

    get sheet(): string {
        return `systems/sohl/templates/item/${this.actor.type}-sheet.hbs`;
    }

    /** @override */
    static defineSchema() {
        return {
            ...super.defineSchema(),
            bioImage: new FilePathField({
                categories: ["IMAGE"],
                initial: CONST.DEFAULT_TOKEN,
            }),
            description: new HTMLField(),
            biography: new HTMLField(),
        };
    }
}
