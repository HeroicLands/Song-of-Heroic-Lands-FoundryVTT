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
import { SohlLogic } from "@common";
import { SohlDataModel } from "@common/SohlDataModel";
import { defineType } from "@utils";
import { RegisterClass } from "@utils/decorators";
import { Philosophy, Skill, SohlItem, SubTypeMixin } from ".";
import { SohlAction } from "@common/event";
import { ValueModifier } from "@common/modifier";
const kMystery = Symbol("Mystery");
const kData = Symbol("Mystery.Data");
const { SchemaField, ArrayField, NumberField, StringField, BooleanField } =
    foundry.data.fields;

@RegisterClass(
    new SohlLogic.Element({
        kind: "Mystery",
    }),
)
export class Mystery extends SohlLogic implements Mystery.Logic {
    declare readonly parent: Mystery.Data;
    readonly [kMystery] = true;
    assocPhilosophy!: SohlItem | null;
    skills!: SohlItem[];
    level!: ValueModifier;
    charges!: {
        value: ValueModifier;
        max: ValueModifier;
    };

    static isA(obj: unknown): obj is Mystery {
        return typeof obj === "object" && obj !== null && kMystery in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
        this.assocPhilosophy =
            this.actor?.items.find(
                (it) =>
                    Philosophy.isA(it.system) &&
                    it.name === this.parent.config.assocPhilosophy,
            ) || null;
        this.skills =
            this.actor?.items.filter(
                (it) =>
                    Skill.Data.isA(it.system) &&
                    it.name &&
                    this.parent.skills.includes(it.name),
            ) || [];
        this.level = sohl.game.CONFIG.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.parent.levelBase);
        this.charges = {
            value: sohl.game.CONFIG.ValueModifier({}, { parent: this }).setBase(
                this.parent.charges.value,
            ),
            max: sohl.game.CONFIG.ValueModifier({}, { parent: this }).setBase(
                this.parent.charges.max,
            ),
        };
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace Mystery {
    /**
     * The type moniker for the Domain item.
     */
    export const Kind = "mystery";

    /**
     * The FontAwesome icon class for the Domain item.
     */
    export const IconCssClass = "fas fa-sparkles";

    /**
     * The image path for the Domain item.
     */
    export const Image = "systems/sohl/assets/icons/sparkles.svg";

    export const {
        kind: SUBTYPE,
        values: SubTypes,
        isValue: isSubType,
    } = defineType("SOHL.Mystery.SubType", {
        GRACE: "grace",
        PIETY: "piety",
        FATE: "fate",
        FATEBONUS: "fateBonus",
        FATEPOINTBONUS: "fatePointBonus",
        BLESSING: "blessing",
        ANCESTOR: "ancestor",
        TOTEM: "totem",
    });
    export type SubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

    export const {
        kind: CATEGORY,
        values: Categories,
        isValue: isCategory,
    } = defineType("SOHL.Mystery.Category", {
        DIVINE: "divinedomain",
        SKILL: "skill",
        CREATURE: "creature",
        NONE: "none",
    });
    export type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

    export const {
        kind: CATEGORYMAP,
        values: CategoryMaps,
        isValue: isCategoryMap,
    } = defineType("SOHL.MysticalAbility.Degree", {
        [SUBTYPE.GRACE]: CATEGORY.DIVINE,
        [SUBTYPE.PIETY]: CATEGORY.DIVINE,
        [SUBTYPE.FATE]: CATEGORY.SKILL,
        [SUBTYPE.FATEBONUS]: CATEGORY.SKILL,
        [SUBTYPE.FATEPOINTBONUS]: CATEGORY.NONE,
        [SUBTYPE.BLESSING]: CATEGORY.DIVINE,
        [SUBTYPE.ANCESTOR]: CATEGORY.SKILL,
        [SUBTYPE.TOTEM]: CATEGORY.CREATURE,
    });
    export type CategoryMap = (typeof CATEGORYMAP)[keyof typeof CATEGORYMAP];

    export interface Logic extends SubTypeMixin.Logic<SubType> {
        readonly parent: Mystery.Data;
        readonly [kMystery]: true;
        assocPhilosophy: SohlItem | null;
        skills: SohlItem[];
        level: ValueModifier;
        charges: {
            value: ValueModifier;
            max: ValueModifier;
        };
    }

    export interface Data extends SubTypeMixin.Data<SubType> {
        readonly [kData]: true;
        get logic(): Mystery.Logic;
        config: {
            usesCharges: boolean;
            usesSkills: boolean;
            assocPhilosophy: string;
            category: Category;
        };
        skills: string[];
        levelBase: number;
        charges: {
            value: number;
            max: number;
        };
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: Mystery.SubType,
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
        Mystery.SubType,
        typeof Mystery.SubTypes
    >(
        SohlItem.DataModel,
        Mystery.SubTypes,
    ) as unknown as Constructor<Mystery.Data> &
        SohlDataModel.TypeDataModelStatics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: Mystery,
            iconCssClass: "fas fa-sparkles",
            img: "systems/sohl/assets/icons/sparkles.svg",
            sheet: "systems/sohl/templates/item/mystery-sheet.hbs",
            schemaVersion: "0.6.0",
            subTypes: SubTypes,
        }),
    )
    export class DataModel extends DataModelShape {
        readonly [kData] = true;
        static override readonly LOCALIZATION_PREFIXES = ["Mystery"];
        declare subType: SubType;
        declare config: {
            usesCharges: boolean;
            usesSkills: boolean;
            assocPhilosophy: string;
            category: Category;
        };
        declare skills: string[];
        declare levelBase: number;
        declare charges: {
            value: number;
            max: number;
        };

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        get logic(): Mystery.Logic {
            return super.logic as Mystery.Logic;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                config: new SchemaField({
                    usesCharges: new BooleanField({ initial: false }),
                    usesSkills: new BooleanField({ initial: false }),
                    assocPhilosophy: new StringField(),
                    category: new StringField({
                        initial: CATEGORY.NONE,
                        required: true,
                        choices: Categories,
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

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/mystery.hbs",
                },
            });
    }
}
