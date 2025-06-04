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

import { DomainData, isPhilosophyData } from "@common/item/datamodel";
import { PerformerClassRegistryElement, SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "DomainPerformer",
    }),
)
export class DomainPerformer extends SohlPerformer<DomainData> {
    category?: string;

    initialize(options?: PlainObject): void {
        if (isPhilosophyData(this.item?.nestedIn)) {
            this.category = this.item.nestedIn.system.subType;
        }
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {}
}
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

import { SohlItem } from "@common/item";
import { DomainPerformer } from "@common/item/performer";
import { SohlItemData, SohlItemDataModel } from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common/SohlBaseDataModel";
import { RegisterClass } from "@utils/decorators";
import { defineType, isOfType } from "@utils";
const { ArrayField, StringField } = (foundry.data as any).fields;

export const DOMAIN_TYPE = "domain" as const;
export const isDomainData = (obj: any): obj is DomainData =>
    isOfType(obj, DOMAIN_TYPE);

export const {
    kind: DIVINE_EMBODIMENT_CATEGORY,
    values: DivineEmbodimentCategories,
    isValue: isDivineEmbodimentCategory,
} = defineType({
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
export type DivineEmbodimentCategory =
    (typeof DIVINE_EMBODIMENT_CATEGORY)[keyof typeof DIVINE_EMBODIMENT_CATEGORY];

export const {
    kind: ELEMENT_CATEGORY,
    values: ElementCategories,
    isValue: isElementCategory,
} = defineType({
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

export interface DomainData extends SohlItemData<DomainPerformer> {
    abbrev: string;
    cusp: string;
    magicMod: ElementCategory[];
    embodiments: DivineEmbodimentCategory[];
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: DOMAIN_TYPE,
        logicClass: DomainPerformer,
        iconCssClass: "fas fa-sparkle",
        img: "systems/sohl/assets/icons/sparkle.svg",
        sheet: "systems/sohl/templates/item/domain-sheet.hbs",
        schemaVersion: "0.6.0",
    }),
)
export class DomainDataModel
    extends SohlItemDataModel<DomainPerformer>
    implements DomainData
{
    static override readonly LOCALIZATION_PREFIXES = ["DOMAIN"];
    declare readonly parent: SohlItem<DomainPerformer>;
    abbrev!: string;
    cusp!: string;
    magicMod!: ElementCategory[];
    embodiments!: DivineEmbodimentCategory[];

    static defineSchema() {
        return {
            ...super.defineSchema(),
            abbrev: new StringField(),
            cusp: new StringField(),
            magicMod: new ArrayField(
                new StringField({
                    choices: Object.values(ELEMENT_CATEGORY),
                    initial: ELEMENT_CATEGORY.ARCANA,
                    required: true,
                }),
            ),
            embodiments: new ArrayField(
                new StringField({
                    choices: Object.values(DIVINE_EMBODIMENT_CATEGORY),
                    initial: DIVINE_EMBODIMENT_CATEGORY.DREAMS,
                    required: true,
                }),
            ),
        };
    }
}
