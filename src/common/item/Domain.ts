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

import {
    DOMAIN_ELEMENT_CATEGORY,
    DOMAIN_EMBODIMENT_CATEGORY,
    DomainElementCategories,
    DomainElementCategory,
    DomainEmbodimentCategories,
    DomainEmbodimentCategory,
} from "@utils/constants";
import type { SohlEventContext } from "@common/event/SohlEventContext";

import { SohlItem } from "@common/item/SohlItem";
import { Philosophy } from "@common/item/Philosophy";
const kDomain = Symbol("Domain");
const kData = Symbol("Domain.Data");
const { ArrayField, StringField } = foundry.data.fields;

export class Domain extends SohlItem.BaseLogic implements Domain.Logic {
    declare readonly _parent: Domain.Data;
    philosophy?: SohlItem;
    category?: string;
    readonly [kDomain] = true;

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        if (Philosophy.Data.isA(this.item?.nestedIn?.system)) {
            this.category = this.item?.nestedIn?.system.subType;
        }
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

export namespace Domain {
    export interface Logic extends SohlItem.Logic {
        readonly _parent: Domain.Data;
        readonly [kDomain]: true;
        philosophy?: SohlItem;
    }

    export interface Data extends SohlItem.Data {
        readonly [kData]: true;
        philosophy: string;
        abbrev: string;
        cusp: string;
        magicMod: DomainElementCategory[];
        embodiments: DomainEmbodimentCategory[];
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export class DataModel extends SohlItem.DataModel.Shape implements Data {
        static readonly LOCALIZATION_PREFIXES = ["Domain"];
        abbrev!: string;
        cusp!: string;
        philosophy!: string;
        magicMod!: DomainElementCategory[];
        embodiments!: DomainEmbodimentCategory[];
        readonly [kData] = true;

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                abbrev: new StringField(),
                cusp: new StringField(),
                philosophy: new StringField(),
                magicMod: new ArrayField(
                    new StringField({
                        initial: DOMAIN_ELEMENT_CATEGORY.ARCANA,
                        required: true,
                        choices: DomainElementCategories,
                    }),
                ),
                embodiments: new ArrayField(
                    new StringField({
                        initial: DOMAIN_EMBODIMENT_CATEGORY.DREAMS,
                        required: true,
                        choices: DomainEmbodimentCategories,
                    }),
                ),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/domain.hbs",
                },
            });
    }
}
