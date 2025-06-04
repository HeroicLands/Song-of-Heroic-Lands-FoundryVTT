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

import { PhilosophyData } from "@common/item/datamodel";
import { PerformerClassRegistryElement, SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "PhilosophyPerformer",
    }),
)
export class PhilosophyPerformer extends SohlPerformer<PhilosophyData> {
    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {}

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
import { PhilosophyPerformer } from "@common/item/performer";
import { SubTypeData, SubTypeDataModel } from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common/SohlBaseDataModel";
import { RegisterClass } from "@utils/decorators";
import { defineType, isOfType } from "@utils";
const { StringField } = (foundry.data as any).fields;

export const PHILOSOPHY_TYPE = "philosophy" as const;
export const isPhilosophyData = (obj: any): obj is PhilosophyData =>
    isOfType(obj, PHILOSOPHY_TYPE);

export const {
    kind: PHILOSOPHY_SUBTYPE,
    values: PhilosophySubTypes,
    isValue: isPhilosophySubType,
} = defineType({
    ARCANE: "arcane",
    DIVINE: "divine",
    SPIRIT: "spirit",
    ASTRAL: "astral",
    NATURAL: "natural",
});
export type PhilosophySubType =
    (typeof PHILOSOPHY_SUBTYPE)[keyof typeof PHILOSOPHY_SUBTYPE];

export interface PhilosophyData
    extends SubTypeData<PhilosophyPerformer, PhilosophySubType> {}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: PHILOSOPHY_TYPE,
        logicClass: PhilosophyPerformer,
        iconCssClass: "fas fa-sparkle",
        img: "systems/sohl/assets/icons/sparkle.svg",
        sheet: "systems/sohl/templates/item/philosophy-sheet.hbs",
        schemaVersion: "0.6.0",
        subTypes: Object.values(PHILOSOPHY_SUBTYPE),
    }),
)
export class PhilosophyDataModel
    extends SubTypeDataModel<PhilosophyPerformer, PhilosophySubType>
    implements PhilosophyData
{
    static override readonly LOCALIZATION_PREFIXES = ["PHILOSOPHY"];
    declare readonly parent: SohlItem<PhilosophyPerformer>;
}
