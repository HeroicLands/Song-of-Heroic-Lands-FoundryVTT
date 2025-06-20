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

import { SohlAction } from "@common/event";
import { SohlLogic } from "@common/SohlLogic";
import { defineType } from "@utils";
import { RegisterClass } from "@utils/decorators";
import { SohlItem, Philosophy } from "@common/item";
import { SohlDataModel } from "@common";

const { ArrayField, StringField } = (foundry.data as any).fields;

@RegisterClass(
    new SohlLogic.Element({
        kind: "Domain",
    }),
)
export class Domain<TData extends Domain.Data = Domain.Data>
    extends SohlLogic<Domain.Data>
    implements Domain.Logic<TData>
{
    declare readonly parent: TData;
    category?: string;

    initialize(options?: PlainObject): void {
        if (Philosophy.isA(this.item?.nestedIn)) {
            this.category = this.item?.nestedIn?.system.subType;
        }
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace Domain {
    /**
     * The type moniker for the Domain item.
     */
    export const Kind = "domain";

    /**
     * The FontAwesome icon class for the Domain item.
     */
    export const IconCssClass = "fas fa-sparkle";

    /**
     * The image path for the Domain item.
     */
    export const Image = "systems/sohl/assets/icons/sparkle.svg";

    export const {
        kind: EMBODIMENT_CATEGORY,
        values: EmbodimentCategories,
        isValue: isEmbodimentCategory,
    } = defineType("SOHL.Domain.EMBODIMENT_CATEGORY", {
        DREAMS: "dreams",
        DEATH: "death",
        VIOLENCE: "violence",
        PEACE: "peace",
        FERTILITY: "fertility",
        ORDER: "order",
        KNOWLEDGE: "knowledge",
        PROSPERITY: "prosperity",
        FIRE: "fire",
        CREATION: "creation",
        VOYAGER: "voyager",
        DECAY: "decay",
    });
    export type EmbodimentCategory =
        (typeof EMBODIMENT_CATEGORY)[keyof typeof EMBODIMENT_CATEGORY];

    export const {
        kind: ELEMENT_CATEGORY,
        values: ElementCategories,
        isValue: isElementCategory,
    } = defineType("SOHL.Domain.ELEMENT_CATEGORY", {
        FIRE: "fire",
        WATER: "water",
        EARTH: "earth",
        SPIRIT: "spirit",
        WIND: "wind",
        METAL: "metal",
        ARCANA: "arcana",
    });
    export type ElementCategory =
        (typeof ELEMENT_CATEGORY)[keyof typeof ELEMENT_CATEGORY];

    export interface Logic<TData extends Data = Data>
        extends SohlLogic.Logic<TData> {}

    export interface Data extends SohlItem.Data {
        abbrev: string;
        cusp: string;
        magicMod: ElementCategory[];
        embodiments: EmbodimentCategory[];
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: Domain,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel extends SohlItem.DataModel<Domain> implements Data {
        static readonly LOCALIZATION_PREFIXES = ["Domain"];
        declare abbrev: string;
        declare cusp: string;
        declare magicMod: ElementCategory[];
        declare embodiments: EmbodimentCategory[];

        static defineSchema() {
            return {
                ...super.defineSchema(),
                abbrev: new StringField(),
                cusp: new StringField(),
                magicMod: new ArrayField(
                    new StringField({
                        initial: ELEMENT_CATEGORY.ARCANA,
                        required: true,
                        choices: ElementCategories,
                    }),
                ),
                embodiments: new ArrayField(
                    new StringField({
                        initial: EMBODIMENT_CATEGORY.DREAMS,
                        required: true,
                        choices: EmbodimentCategories,
                    }),
                ),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/domain.hbs",
                },
            });
    }
}
