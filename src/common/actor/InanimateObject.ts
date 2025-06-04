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

import { SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";
import { SohlAction } from "@common/event";
import { SohlActor } from "@common/actor";
import { SohlClassRegistry } from "@utils";
const { NumberField } = foundry.data.fields;

@RegisterClass(new SohlClassRegistry.Element(InanimateObject.Kind))
export class InanimateObject extends SohlPerformer<InanimateObject.Data> {
    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {}
}

export namespace InanimateObject {
    /**
     * The type moniker for the InanimateObject actor.
     */
    export const Kind = "object";

    /**
     * The paths to the document sheet handlebars partials for the InanimateObject actor.
     */
    export const SheetPartials = [
        "systems/sohl/templates/actor/inanimateobject-sheet.hbs",
    ];

    /**
     * The FontAwesome icon class for the InanimateObject actor.
     */
    export const IconCssClass = "fas fa-treasure-chest";

    /**
     * The image path for the InanimateObject actor.
     */
    export const Image = "systems/sohl/assets/icons/chest.svg";

    /**
     * The data shape for the InanimateObject actor.
     */
    export interface Data extends SohlActor.Data<InanimateObject> {
        maxCapacity: number;
    }

    /**
     * The Foundry VTT data model for the InanimateObject actor.
     */
    @RegisterClass(
        new SohlClassRegistry.DataModelElement({
            kind: Kind,
            logicClass: InanimateObject,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel
        extends SohlActor.DataModel<InanimateObject>
        implements Data
    {
        maxCapacity!: number;
        static override readonly LOCALIZATION_PREFIXES = ["OBJECT"];

        static defineSchema() {
            return {
                ...super.defineSchema(),
                maxCapacity: new NumberField({
                    integer: true,
                    initial: 0,
                }),
            };
        }
    }
}
