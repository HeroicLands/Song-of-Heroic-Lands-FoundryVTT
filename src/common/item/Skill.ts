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
import { SohlDataModel, SohlLogic } from "@common";
import { SohlAction } from "@common/event";
import { MasteryLevelMixin, SohlItem, SubTypeMixin } from "@common/item";
import { defineType } from "@utils";
import { RegisterClass } from "@utils/decorators";
const kSkill = Symbol("Skill");
const kData = Symbol("Skill.Data");
const { StringField } = (foundry.data as any).fields;

@RegisterClass(
    new SohlLogic.Element({
        kind: "Skill",
    }),
)
export class Skill
    extends SubTypeMixin(MasteryLevelMixin(SohlLogic))
    implements Skill.Logic
{
    declare readonly parent: Skill.Data;
    readonly [kSkill] = true;

    static isA(obj: unknown): obj is Skill {
        return typeof obj === "object" && obj !== null && kSkill in obj;
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

export namespace Skill {
    /**
     * The type moniker for the Skill item.
     */
    export const Kind = "skill";

    /**
     * The FontAwesome icon class for the Skill item.
     */
    export const IconCssClass = "fas fa-head-side-gear";

    /**
     * The image path for the Skill item.
     */
    export const Image = "systems/sohl/assets/icons/head-gear.svg";

    export const {
        kind: SUBTYPE,
        values: SubTypes,
        isValue: isSubType,
    } = defineType("SOHL.Skill.SubType", {
        SOCIAL: "social",
        NATURE: "nature",
        CRAFT: "craft",
        LORE: "lore",
        LANGUAGE: "language",
        SCRIPT: "script",
        RITUAL: "ritual",
        PHYSICAL: "physical",
        COMBAT: "combat",
        ESOTERIC: "esoteric",
    });
    export type SubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

    export const {
        kind: COMBAT,
        values: CombatTypes,
        isValue: isCombatType,
    } = defineType("SOHL.Skill.Combat", {
        NONE: "none",
        ALL: "all",
        MELEE: "melee",
        MISSILE: "missile",
        MELEEMISSILE: "meleemissile",
        MANEUVER: "maneuver",
        MELEEMANEUVER: "meleemaneuver",
    });
    export type CombatType = (typeof COMBAT)[keyof typeof COMBAT];

    export interface Logic extends SohlLogic.Logic {
        readonly parent: Skill.Data;
        readonly [kSkill]: true;
    }

    export interface Data
        extends MasteryLevelMixin.Data,
            SubTypeMixin.Data<SubType> {
        get logic(): Skill.Logic;
        readonly [kData]: true;
        weaponGroup: string;
        baseSkill: string;
        domain: string;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        SubType,
        typeof SubTypes
    >(
        MasteryLevelMixin.DataModel(SohlItem.DataModel),
        SubTypes,
    ) as unknown as Constructor<Skill.Data> & SohlItem.DataModel.Statics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: Skill,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
            subTypes: SubTypes,
        }),
    )
    export class DataModel extends DataModelShape implements Data {
        static readonly LOCALIZATION_PREFIXES = ["Skill"];
        declare abbrev: string;
        declare skillBaseFormula: string;
        declare masteryLevelBase: number;
        declare improveFlag: boolean;
        declare weaponGroup: string;
        declare baseSkill: string;
        declare domain: string;
        declare subType: SubType;
        readonly [kData] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                weaponGroup: new StringField({
                    initial: COMBAT.NONE,
                    blank: false,
                    choices: Object.values(COMBAT),
                }),
                baseSkill: new StringField(),
                domain: new StringField(),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/skill.hbs",
                },
            });
    }
}
