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
import { Skill } from "@common/item/Skill";
import {
    kMasteryLevelMixin,
    MasteryLevelMixin,
} from "@common/item/MasteryLevelMixin";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import type { SohlAction } from "@common/event/SohlAction";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import {
    ITEM_KIND,
    MYSTERY_CATEGORY,
    MYSTERY_CATEGORYMAP,
    MYSTERY_SUBTYPE,
    MysterySubType,
    MysterySubTypes,
} from "@utils/constants";
import { getDocsFromPacks, getDocumentFromPacks } from "@common/FoundryProxy";
const kMystery = Symbol("Mystery");
const kData = Symbol("Mystery.Data");
const { SchemaField, ArrayField, NumberField, StringField } =
    foundry.data.fields;

/**
 * The Mystery class represents a mystical power associated with an
 * entity, either a character or an object. These powers may or may not
 * need to be activated. However, in many cases these mysteries can be "used up",
 * as such mysteries may have charges which may increase or decrease.
 *
 * Mysteries optionally have a category:
 *    Skill: These mysteries primarily enhance a character's chance of
 *           success with a skill or skills.
 *    Creature: These mysteries are tied to a specific type of creature.
 *    Divine: These mysteries are granted by a divine entity or force.
 *
 * The following mysteries are supported:
 *     Grace (Divine): Divine favor which manifests as granting of a wish
 *     Piety (Divine): A deep devotion to a religion
 *     Fate (Skill): The number of times the entity can influence the outcome of a random event
 *     FateBonus (Skill): A temporary bonus to the fate roll
 *     FatePointBonus (None): An increase in the number of fate points available
 *     Blessing (Divine): Religious fervor increasing mastery level for a particular skill
 *     Ancestor Spirit Power (Skill): Ancestor spirit connection increasing mastery level of a skill
 *     Totem Spirit Power (Creature): A spiritual connection to an animal, granting skill bonuses
 */
export class Mystery
    extends SubTypeMixin(MasteryLevelMixin(SohlItem.BaseLogic))
    implements Mystery.Logic
{
    declare [kMasteryLevelMixin]: true;
    declare readonly parent: Mystery.Data;
    readonly [kMystery] = true;
    domain?: SohlItem;
    skills!: SohlItem[];
    level!: ValueModifier;
    charges!: {
        value: ValueModifier;
        max: ValueModifier;
    };

    get fieldData(): string {
        const category = MYSTERY_CATEGORYMAP[this.parent.subType];

        let field: string = "";
        switch (category) {
            case MYSTERY_CATEGORY.DIVINE:
                if (!this.actor) return this.parent.domain.philosophy;
                field =
                    this.actor.allItems.find(
                        (d) =>
                            d.type === ITEM_KIND.DOMAIN &&
                            d.name === this.parent.domain.name &&
                            d.system.philosophy ===
                                this.parent.domain.philosophy,
                    )?.name ?? "";
                break;

            case MYSTERY_CATEGORY.SKILL:
                if (this.skills.length) {
                    field = sohl.i18n.formatListOr(
                        Array.from(this.skills.values()),
                    );
                } else {
                    field = "SOHL.AllSkills";
                }
                break;

            case MYSTERY_CATEGORY.CREATURE:
                if (!this.actor) return this.parent.domain.philosophy;
                field =
                    this.actor.allItems.find(
                        (d) =>
                            d.type === ITEM_KIND.DOMAIN &&
                            d.name === this.parent.domain.name &&
                            d.system.philosophy ===
                                this.parent.domain.philosophy,
                    )?.name ?? "";
                break;

            default:
                field = "SOHL.Mystery.UnknownDomain";
                break;
        }

        return field;
    }

    getApplicableFate(target: SohlItem): SohlItem[] {
        const result: SohlItem[] = [];
        if (
            Mystery.Data.isA(this) &&
            this.parent.subType === MYSTERY_SUBTYPE.FATE
        ) {
            // If a fate item has a list of skills, then that fate
            // item is only applicable to those skills.  If the fate item
            // has no list of skills, then the fate item is applicable
            // to all skills.
            if (!this.skills.length || this.skills.includes(target.name)) {
                if (this.level.effective > 0) result.push(this.item);
            }
        }
        return result;
    }

    _usesCharges(): boolean {
        return (
            [
                MYSTERY_SUBTYPE.FATE,
                MYSTERY_SUBTYPE.FATEBONUS,
                MYSTERY_SUBTYPE.FATEPOINTBONUS,
                MYSTERY_SUBTYPE.GRACE,
                MYSTERY_SUBTYPE.PIETY,
            ] as MysterySubType[]
        ).includes(this.parent.subType);
    }

    _usesLevels(): boolean {
        return (
            [
                MYSTERY_SUBTYPE.ANCESTORSPIRITPOWER,
                MYSTERY_SUBTYPE.TOTEMSPIRITPOWER,
            ] as MysterySubType[]
        ).includes(this.parent.subType);
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
        if (this.actor) {
            this.skills = [];
            const skillSet = new Set<string>(this.parent.skills);
            for (const it of this.actor.dynamicAllItems()) {
                // Find the designated domain item and store it in `this.domain`
                if (
                    !this.domain &&
                    it.type === ITEM_KIND.DOMAIN &&
                    it.name === this.parent.domain.name &&
                    it.system.philosophy === this.parent.domain.philosophy
                ) {
                    this.domain = it;
                }

                // Find all skills that match the parent's skill list
                if (
                    Skill.DataModel.isA(it.system) &&
                    !!it.name &&
                    skillSet.has(it.name)
                ) {
                    this.skills.push(it);
                    skillSet.delete(it.name);
                }
            }

            if (!this.domain && this.parent.domain.name) {
                // First, try to find the domain in the compendiums
                getDocsFromPacks(["sohl.mysteries"], {
                    docType: "domain",
                }).then((docs) => {
                    // We have an array of domain documents from the compendium; search for the one we want
                    this.domain = docs.find(
                        (d) =>
                            d.name === this.parent.domain.name &&
                            d.system.philosophy ===
                                this.parent.domain.philosophy,
                    );

                    // If we can't find the domain by name, create a dummy one
                    if (!this.domain)
                        this.domain = new SohlItem({
                            name: this.parent.domain.name,
                            type: "domain",
                            "system.philosophy": this.parent.domain.philosophy,
                        });
                    this.actor?.addVirtualItem(this.domain);
                });
            }

            // `skillSet` now contains all skills that were not found in the actor's items
            // We need to now create temporary items for each of those skills, so we can use
            // them in later stages. Some mysteries allow temporary aquisition of skills, even if
            // the actor does not possess them.
            //
            // Note that any such skills will be added as ML 0; only the skill will be added, but no
            // mastery at all (at least at this point).
            for (const skillName of skillSet) {
                // First, try to find the skill in the compendiums
                getDocumentFromPacks(skillName, ["sohl.characteristics"], {
                    docType: "skill",
                }).then((doc) => {
                    // If we can't find the skill by name, create a dummy one
                    if (!doc)
                        doc = new SohlItem({ name: skillName, type: "skill" });
                    this.skills.push(doc);
                    this.actor?.addVirtualItem(doc);
                });
            }
        }

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
    override evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace Mystery {
    export interface Logic
        extends MasteryLevelMixin.Logic,
            SubTypeMixin.Logic<MysterySubType> {
        readonly parent: Mystery.Data;
        readonly [kMystery]: true;
        getApplicableFate(target: SohlItem): SohlItem[];
        domain?: SohlItem;
        skills: SohlItem[];
        level: ValueModifier;
        charges: {
            value: ValueModifier;
            max: ValueModifier;
        };
    }

    export namespace Logic {
        export function isA(obj: unknown): obj is Mystery {
            return typeof obj === "object" && obj !== null && kMystery in obj;
        }
    }

    export interface Data
        extends MasteryLevelMixin.Data,
            SubTypeMixin.Data<MysterySubType> {
        readonly [kData]: true;
        domain: {
            philosophy: string;
            name: string;
        };
        skills: string[];
        levelBase: number;
        charges: {
            value: number;
            max: number;
        };
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
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
        domain!: {
            philosophy: string;
            name: string;
        };
        skills!: string[];
        levelBase!: number;
        charges!: {
            value: number;
            max: number;
        };

        get logic(): Mystery.Logic {
            return super.logic as Mystery.Logic;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                domain: new SchemaField({
                    philosophy: new StringField(),
                    name: new StringField(),
                }),
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
                    // Note: if value is -1, then there are infinite charges remaining
                    value: new NumberField({
                        integer: true,
                        initial: -1,
                        min: -1,
                    }),
                    // Note: if max is 0, then there is no maximum
                    max: new NumberField({
                        integer: true,
                        initial: -1,
                        min: -1,
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
