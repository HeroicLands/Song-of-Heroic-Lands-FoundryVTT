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

import { ProtectionData } from "@common/item/datamodel";
import { PerformerClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { SubTypePerformer } from "@common/item/performer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "ProtectionPerformer",
    }),
)
export class ProtectionPerformer extends SubTypePerformer<ProtectionData> {
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
import { SOHL_VARIANT, SohlVariant } from "@common";
import { ProtectionPerformer } from "@common/item/performer";
import { SubTypeData, SubTypeDataModel } from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { isOfType } from "@utils";
const { SchemaField, NumberField } = (foundry.data as any).fields;

export const PROTECTION_TYPE = "protection" as const;
export const isProtectionData = (obj: any): obj is ProtectionData =>
    isOfType(obj, PROTECTION_TYPE);

export interface ProtectionData
    extends SubTypeData<ProtectionPerformer, SohlVariant> {
    protectionBase: {
        blunt: number;
        edged: number;
        piercing: number;
        fire: number;
    };
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: PROTECTION_TYPE,
        logicClass: ProtectionPerformer,
        iconCssClass: "fas fa-shield",
        img: "systems/sohl/assets/icons/shield.svg",
        sheet: "systems/sohl/templates/item/protection-sheet.hbs",
        schemaVersion: "0.6.0",
        subTypes: Object.values(SOHL_VARIANT),
    }),
)
export class ProtectionDataModel
    extends SubTypeDataModel<ProtectionPerformer, SohlVariant>
    implements ProtectionData
{
    static override readonly LOCALIZATION_PREFIXES = ["PROTECTION"];
    declare readonly parent: SohlItem<ProtectionPerformer>;
    protectionBase!: {
        blunt: number;
        edged: number;
        piercing: number;
        fire: number;
    };

    static defineSchema() {
        return {
            ...super.defineSchema(),
            protectionBase: new SchemaField({
                blunt: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                edged: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                piercing: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                fire: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
            }),
        };
    }
}
