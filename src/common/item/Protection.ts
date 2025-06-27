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
import { SohlDataModel, SohlLogic, SohlSystem } from "@common";
import { RegisterClass } from "@utils/decorators";
import { SohlItem, SubTypeMixin } from ".";
import { SohlAction } from "@common/event";

const { SchemaField, NumberField } = foundry.data.fields;
const kProtection = Symbol("Protection");
const kData = Symbol("Protection.Data");

@RegisterClass(
    new SohlLogic.Element({
        kind: "Protection",
    }),
)
export class Protection
    extends SubTypeMixin(SohlLogic)
    implements Protection.Logic
{
    declare readonly parent: Protection.Data;
    readonly [kProtection] = true;

    static isA(obj: unknown): obj is Protection {
        return typeof obj === "object" && obj !== null && kProtection in obj;
    }
    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace Protection {
    /**
     * The type moniker for the Protection item.
     */
    export const Kind = "protection";

    /**
     * The FontAwesome icon class for the Protection item.
     */
    export const IconCssClass = "fas fa-shield";

    /**
     * The image path for the Protection item.
     */
    export const Image = "systems/sohl/assets/icons/shield.svg";

    export interface Logic extends SohlLogic.Logic {
        readonly [kProtection]: true;
        readonly parent: Protection.Data;
    }

    export interface Data extends SubTypeMixin.Data<SohlSystem.Variant> {
        readonly [kData]: true;
        get logic(): SubTypeMixin.Logic<SohlSystem.Variant>;
        protectionBase: {
            blunt: number;
            edged: number;
            piercing: number;
            fire: number;
        };
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: SohlSystem.Variant,
        ): obj is Data {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kData in obj &&
                (subType ? (obj as Data).subType === subType : true)
            );
        }
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        SohlSystem.Variant,
        typeof SohlSystem.Variants
    >(
        SohlItem.DataModel,
        SohlSystem.Variants,
    ) as unknown as Constructor<Protection.Data> & SohlItem.DataModel.Statics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: Protection,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
            subTypes: SohlSystem.Variants,
        }),
    )
    export class DataModel extends DataModelShape {
        readonly [kData] = true;
        static override readonly LOCALIZATION_PREFIXES = ["Protection"];
        declare subType: SohlSystem.Variant;
        declare protectionBase: {
            blunt: number;
            edged: number;
            piercing: number;
            fire: number;
        };

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

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
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/protection.hbs",
                },
            });
    }
}
