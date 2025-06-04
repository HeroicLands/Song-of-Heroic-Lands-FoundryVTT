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

import { MysteryData } from "@common/item/datamodel";
import { PerformerClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { SubTypePerformer } from "./SubTypePerformer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "MysteryPerformer",
    }),
)
export class MysteryPerformer extends SubTypePerformer<MysteryData> {
    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {
        super.initialize(options);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {
        super.evaluate(options);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {
        super.finalize(options);
    }
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
import { MysteryPerformer } from "@common/item/performer";
import { SubTypeData, SubTypeDataModel } from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { defineType, isOfType } from "@utils";
const { SchemaField, ArrayField, NumberField, StringField, BooleanField } = (
    foundry.data as any
).fields;

export const MYSTERY_TYPE = "mystery" as const;
export const isMysteryData = (obj: any): obj is MysteryData =>
    isOfType(obj, MYSTERY_TYPE);

export const {
    kind: MYSTERY_SUBTYPE,
    values: MysterySubTypes,
    isValue: isMysterySubType,
} = defineType({
    GRACE: "grace",
    PIETY: "piety",
    FATE: "fate",
    FATEBONUS: "fateBonus",
    FATEPOINTBONUS: "fatePointBonus",
    BLESSING: "blessing",
    ANCESTOR: "ancestor",
    TOTEM: "totem",
});
export type MysterySubType =
    (typeof MYSTERY_SUBTYPE)[keyof typeof MYSTERY_SUBTYPE];

export const {
    kind: MYSTERY_KIND,
    values: MysteryKinds,
    isValue: isMysteryKind,
} = defineType({
    DIVINE: "divinedomain",
    SKILL: "skill",
    CREATURE: "creature",
    NONE: "none",
});
export type MysteryKind = (typeof MYSTERY_KIND)[keyof typeof MYSTERY_KIND];

export const DOMAINMAP = {
    [MYSTERY_SUBTYPE.GRACE]: MYSTERY_KIND.DIVINE,
    [MYSTERY_SUBTYPE.PIETY]: MYSTERY_KIND.DIVINE,
    [MYSTERY_SUBTYPE.FATE]: MYSTERY_KIND.SKILL,
    [MYSTERY_SUBTYPE.FATEBONUS]: MYSTERY_KIND.SKILL,
    [MYSTERY_SUBTYPE.FATEPOINTBONUS]: MYSTERY_KIND.NONE,
    [MYSTERY_SUBTYPE.BLESSING]: MYSTERY_KIND.DIVINE,
    [MYSTERY_SUBTYPE.ANCESTOR]: MYSTERY_KIND.SKILL,
    [MYSTERY_SUBTYPE.TOTEM]: MYSTERY_KIND.CREATURE,
};
export type DomainMapValue = (typeof DOMAINMAP)[keyof typeof DOMAINMAP];

export interface MysteryData
    extends SubTypeData<MysteryPerformer, MysterySubType> {
    config: {
        usesCharges: boolean;
        usesSkills: boolean;
        assocPhilosophy: string;
        kind: MysteryKind;
    };
    skills: string[];
    levelBase: number;
    charges: {
        value: number;
        max: number;
    };
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: MYSTERY_TYPE,
        logicClass: MysteryPerformer,
        iconCssClass: "fas fa-sparkles",
        img: "systems/sohl/assets/icons/sparkles.svg",
        sheet: "systems/sohl/templates/item/mystery-sheet.hbs",
        schemaVersion: "0.6.0",
        subTypes: Object.values(MYSTERY_SUBTYPE),
    }),
)
export class MysteryDataModel
    extends SubTypeDataModel<MysteryPerformer, MysterySubType>
    implements MysteryData
{
    static override readonly LOCALIZATION_PREFIXES = ["MYSTERY"];
    declare readonly parent: SohlItem<MysteryPerformer>;
    config!: {
        usesCharges: boolean;
        usesSkills: boolean;
        assocPhilosophy: string;
        kind: MysteryKind;
    };
    skills!: string[];
    levelBase!: number;
    charges!: {
        value: number;
        max: number;
    };

    static defineSchema() {
        return {
            ...super.defineSchema(),
            config: new SchemaField({
                usesCharges: new BooleanField({ initial: false }),
                usesSkills: new BooleanField({ initial: false }),
                assocPhilosophy: new StringField(),
                category: new StringField({
                    initial: MYSTERY_KIND.NONE,
                    required: true,
                    choices: Object.values(MYSTERY_KIND),
                }),
            }),
            domain: new StringField(),
            skills: new ArrayField(
                new StringField({
                    required: true,
                    blank: false,
                }),
            ),
            levelBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            charges: new SchemaField({
                value: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                // Note: if max charges is 0, then there is no maximum
                max: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
            }),
        };
    }
}
