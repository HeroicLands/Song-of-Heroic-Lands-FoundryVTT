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

import { SohlActor } from "@common/actor/SohlActor";
import { ACTOR_KIND } from "@utils/constants";
const { DocumentIdField } = foundry.data.fields;
const kAssembly = Symbol("Assembly");
const kDataModel = Symbol("Assembly.DataModel");

export class Assembly extends SohlActor.BaseLogic implements Assembly.Logic {
    declare readonly _parent: Assembly.Data;

    readonly [kAssembly] = true;

    static isA(obj: unknown): obj is Assembly {
        return typeof obj === "object" && obj !== null && kAssembly in obj;
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

export namespace Assembly {
    /**
     * The paths to the document sheet handlebars partials for the Assembly actor.
     */
    export const SheetPartials = [
        "systems/sohl/templates/actor/assembly-sheet.hbs",
    ];

    /**
     * The data shape for the Assembly actor.
     */
    export interface Logic extends SohlActor.Logic {}

    export interface Data extends SohlActor.Data {
        canonicalItemId: string | null;
    }

    /**
     * The Foundry VTT data model for the Assembly actor.
     */
    export class DataModel extends SohlActor.DataModel implements Data {
        declare canonicalItemId: string | null;
        static override readonly LOCALIZATION_PREFIXES = ["ASSEMBLY"];
        static override readonly kind = ACTOR_KIND.ASSEMBLY;
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
