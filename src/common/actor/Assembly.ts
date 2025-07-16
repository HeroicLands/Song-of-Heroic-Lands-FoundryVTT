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

import { SohlDataModel, SohlLogic } from "@common";
import { RegisterClass } from "@utils/decorators";
import { SohlAction } from "@common/event";
import { SohlActor } from "@common/actor";
import { SohlClassRegistry } from "@utils";
const { DocumentIdField } = foundry.data.fields;
const kAssembly = Symbol("Assembly");
const kDataModel = Symbol("Assembly.DataModel");

@RegisterClass(new SohlClassRegistry.Element(Assembly.Kind))
export class Assembly<TData extends Assembly.Data = Assembly.Data>
    extends SohlLogic
    implements Assembly.Logic<TData>
{
    declare readonly parent: TData;
    readonly [kAssembly] = true;

    static isA(obj: unknown): obj is Assembly {
        return typeof obj === "object" && obj !== null && kAssembly in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace Assembly {
    /**
     * The type moniker for the Assembly actor.
     */
    export const Kind = "assembly";

    /**
     * The paths to the document sheet handlebars partials for the Assembly actor.
     */
    export const SheetPartials = [
        "systems/sohl/templates/actor/assembly-sheet.hbs",
    ];

    /**
     * The FontAwesome icon class for the Assembly actor.
     */
    export const IconCssClass = "fas fa-layer-group";

    /**
     * The image path for the Assembly actor.
     */
    export const Image = "systems/sohl/assets/icons/stack.svg";

    /**
     * The data shape for the Assembly actor.
     */
    export interface Logic<TData extends Data = Data> extends SohlLogic.Logic {}

    export interface Data extends SohlActor.Data {
        canonicalItemUuid: string | null;
    }

    /**
     * The Foundry VTT data model for the Assembly actor.
     */
    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: Assembly,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel extends SohlActor.DataModel implements Data {
        declare canonicalItemUuid: string | null;
        static override readonly LOCALIZATION_PREFIXES = ["ASSEMBLY"];
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                canonicalItemId: new DocumentIdField({
                    initial: null,
                }),
            };
        }
    }
}
