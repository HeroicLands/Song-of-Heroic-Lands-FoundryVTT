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
import { SohlLogic } from "@common/SohlLogic";
import { SohlItem } from "@common/item/SohlItem";
import { Philosophy } from "@common/item/Philosophy";
import { Skill } from "@common/item/Skill";
import {
    kMasteryLevelMixin,
    MasteryLevelMixin,
} from "@common/item/MasteryLevelMixin";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import type { SohlAction } from "@common/event/SohlAction";
import { ValueModifier } from "@common/modifier/ValueModifier";
import {
    MYSTERY_CATEGORY,
    MYSTERY_SUBTYPE,
    MysteryCategories,
    MysteryCategory,
    MysterySubType,
    MysterySubTypes,
} from "@utils/constants";
import { MasteryLevelModifier } from "@common/modifier/MasteryLevelModifier";
const kMystery = Symbol("Mystery");
const kData = Symbol("Mystery.Data");
const { SchemaField, ArrayField, NumberField, StringField, BooleanField } =
    foundry.data.fields;

export class Mystery
    extends SubTypeMixin(MasteryLevelMixin(SohlLogic))
    implements Mystery.Logic
{
    declare masteryLevel: MasteryLevelModifier;
    declare magicMod: number;
    declare boosts: number;
    declare availableFate: SohlItem<SohlLogic, any>[];
    declare valid: boolean;
    declare skillBase: MasteryLevelMixin.SkillBase;
    declare sdrIncr: number;
    declare improveWithSDR: (context: SohlAction.Context) => Promise<void>;
    declare [kMasteryLevelMixin]: true;
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

    get _availableFate(): SohlItem[] {
        const result: SohlItem[] = [];
        if (Mystery.Data.isA(this, MYSTERY_SUBTYPE.FATE)) {
            const logic = this.logic;
            const fateSkills = this.parent.fateSkills;
            // If a fate item has a list of fate skills, then that fate
            // item is only applicable to those skills.  If the fate item
            // has no list of skills, then the fate item is applicable
            // to all skills.
            if (
                !fateSkills.length ||
                fateSkills.includes(this.parent.item?.name || "")
            ) {
                if (logic.level.effective > 0) result.push(this.parent.item);
            }
        }
        return result;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
        this.assocPhilosophy =
            this.actor?.items.find(
                (it) =>
                    Philosophy.DataModel.isA(it.system) &&
                    it.name === this.parent.config.assocPhilosophy,
            ) || null;
        this.skills =
            this.actor?.items.filter(
                (it) =>
                    Skill.DataModel.isA(it.system) &&
                    !!it.name &&
                    this.parent.skills.includes(it.name),
            ) || [];
        this.level = sohl.CONFIG.ValueModifier({}, { parent: this }).setBase(
            this.parent.levelBase,
        );
        this.charges = {
            value: sohl.CONFIG.ValueModifier({}, { parent: this }).setBase(
                this.parent.charges.value,
            ),
            max: sohl.CONFIG.ValueModifier({}, { parent: this }).setBase(
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
    export interface Logic
        extends MasteryLevelMixin.Logic,
            SubTypeMixin.Logic<MysterySubType> {
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

    export interface Data
        extends MasteryLevelMixin.Data,
            SubTypeMixin.Data<MysterySubType> {
        readonly [kData]: true;
        readonly logic: Logic;
        config: {
            usesCharges: boolean;
            usesSkills: boolean;
            assocPhilosophy: string;
            category: MysteryCategory;
        };
        skills: string[];
        fateSkills: string[];
        levelBase: number;
        charges: {
            value: number;
            max: number;
        };
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: MysterySubType,
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
        MysterySubType,
        typeof MysterySubTypes
    >(SohlItem.DataModel, MysterySubTypes) as unknown as Constructor<Data> &
        SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements Mystery.Data {
        readonly [kData] = true;
        static override readonly LOCALIZATION_PREFIXES = ["Mystery"];
        declare subType: MysterySubType;
        config!: {
            usesCharges: boolean;
            usesSkills: boolean;
            assocPhilosophy: string;
            category: MysteryCategory;
        };
        skills!: string[];
        fateSkills!: string[];
        levelBase!: number;
        charges!: {
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
                        initial: MYSTERY_CATEGORY.NONE,
                        required: true,
                        choices: MysteryCategories,
                    }),
                }),
                domain: new StringField(),
                skills: new ArrayField(
                    new StringField({
                        required: true,
                        blank: false,
                    }),
                ),
                fateSkills: new ArrayField(
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
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/mystery.hbs",
                },
            });
    }
}
