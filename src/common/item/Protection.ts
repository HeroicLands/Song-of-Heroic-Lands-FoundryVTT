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

import { SohlItem } from "@common/item/SohlItem";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import type { SohlEventContext } from "@common/event/SohlEventContext";

import { ITEM_KIND, Variant, Variants } from "@utils/constants";
import { ArmorGear } from "./ArmorGear";
import { ValueModifier } from "@common/modifier/ValueModifier";

const { SchemaField, NumberField } = foundry.data.fields;
const kProtection = Symbol("Protection");
const kData = Symbol("Protection.Data");

export class Protection
    extends SubTypeMixin(SohlItem.BaseLogic)
    implements Protection.Logic
{
    declare readonly _parent: Protection.Data;
    bodyLocations!: SohlItem[];
    protection!: StrictObject<ValueModifier>;
    readonly [kProtection] = true;

    static isA(obj: unknown): obj is Protection {
        return typeof obj === "object" && obj !== null && kProtection in obj;
    }
    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        this.bodyLocations = [];
        this.protection = {
            blunt: new sohl.ValueModifier({}, { parent: this }).setBase(
                this._parent.protectionBase.blunt,
            ),
            edged: new sohl.ValueModifier({}, { parent: this }).setBase(
                this._parent.protectionBase.edged,
            ),
            piercing: new sohl.ValueModifier({}, { parent: this }).setBase(
                this._parent.protectionBase.piercing,
            ),
            fire: new sohl.ValueModifier({}, { parent: this }).setBase(
                this._parent.protectionBase.fire,
            ),
        };
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        if (!this.item.nestedIn || this._parent.subType !== sohl.id) return;
        super.evaluate(context);

        let armorGearData: ArmorGear.Data | undefined;
        if (
            this.item.nestedIn.type === ITEM_KIND.ARMORGEAR &&
            this.item.nestedIn.system.isEquipped
        ) {
            armorGearData = this.item.nestedIn.system;
            this.bodyLocations =
                this.actor?.allItemTypes[ITEM_KIND.BODYLOCATION].filter(
                    (i) =>
                        armorGearData?.locations.flexible.includes(i.name) ||
                        armorGearData?.locations.rigid.includes(i.name),
                ) || [];
        } else if (this.item.nestedIn.type === ITEM_KIND.BODYLOCATION) {
            this.bodyLocations.push(this.item.nestedIn);
        }

        this.bodyLocations.forEach((bl) => {
            const blData = bl.system;
            Object.keys(this.protection).forEach((aspect) => {
                if (this.protection[aspect].effective)
                    blData.$protection[aspect]?.add(
                        this.item.name,
                        this.item.name,
                        this.protection[aspect].effective,
                    );
            });

            if (armorGearData) {
                // if a material has been specified, add it to the layers
                if (armorGearData.material) {
                    if (blData.$layers) blData.$layers += ",";
                    blData.$layers += armorGearData.material;
                }

                // If any of the armor is rigid, then flag the whole bodylocation as rigid.
                blData.$traits.isRigid ||=
                    armorGearData.locations.rigid.includes(bl.name);
            }
        });
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace Protection {
    export interface Logic extends SubTypeMixin.Logic {
        readonly [kProtection]: true;
        readonly _parent: Protection.Data;
    }

    export interface Data extends SubTypeMixin.Data<Variant> {
        readonly [kData]: true;
        protectionBase: {
            blunt: number;
            edged: number;
            piercing: number;
            fire: number;
        };
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        Variant,
        typeof Variants
    >(SohlItem.DataModel, Variants) as unknown as Constructor<Protection.Data> &
        SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape {
        readonly [kData] = true;
        static override readonly LOCALIZATION_PREFIXES = ["Protection"];
        declare subType: Variant;
        declare protectionBase: {
            blunt: number;
            edged: number;
            piercing: number;
            fire: number;
        };

        static defineSchema(): foundry.data.fields.DataSchema {
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

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/protection.hbs",
                },
            });
    }
}
