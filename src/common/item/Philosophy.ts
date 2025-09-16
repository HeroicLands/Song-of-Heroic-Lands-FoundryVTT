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
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import { PhilosophySubType, PhilosophySubTypes } from "@utils/constants";
const kPhilosophy = Symbol("Philosophy");
const kData = Symbol("Philosophy.Data");

export class Philosophy extends SohlItem.BaseLogic implements Philosophy.Logic {
    declare readonly _parent: Philosophy.Data;
    readonly [kPhilosophy] = true;

    static isA(obj: unknown): obj is Philosophy {
        return typeof obj === "object" && obj !== null && kPhilosophy in obj;
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

export namespace Philosophy {
    export interface Logic extends SohlItem.Logic {
        readonly [kPhilosophy]: true;
        readonly _parent: Philosophy.Data;
    }

    export interface Data extends SubTypeMixin.Data<PhilosophySubType> {
        readonly [kData]: true;
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        PhilosophySubType,
        typeof PhilosophySubTypes
    >(
        SohlItem.DataModel,
        PhilosophySubTypes,
    ) as unknown as Constructor<Philosophy.Data> & SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape {
        declare subType: PhilosophySubType;
        static override readonly LOCALIZATION_PREFIXES = ["Philosophy"];
        readonly [kData] = true;
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/philosophy.hbs",
                },
            });
    }
}
