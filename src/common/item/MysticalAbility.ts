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

import type { SohlAction } from "@common/event/SohlAction";
import {
    kMasteryLevelMixin,
    MasteryLevelMixin,
} from "@common/item/MasteryLevelMixin";
import { SohlItem } from "@common/item/SohlItem";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import {
    ITEM_KIND,
    MYSTICALABILITY_SUBTYPE,
    MysticalAbilitySubType,
    MysticalAbilitySubTypes,
} from "@utils/constants";
const kMysticalAbility = Symbol("MysticalAbility");
const kData = Symbol("MysticalAbility.Data");
const { SchemaField, NumberField, StringField, BooleanField } =
    foundry.data.fields;

/**
 * The MysticalAbility class represents a mystical ability associated with an
 * entity, either a character or an object. These powers generally must
 * be activated, and often the results or success of the powers are
 * determined at least partially randomly.
 *
 * The following ability subtypes are supported:
 *   Shamanic Rite: Perform a shamanic rite on target(s)
 *   Spirit Action: Perform a spirit action (Roaming, Sensing, Communing, Immersion, Conflict, etc.)
 *   Spirit Power: Perform a spirit power (Ancestor, Totem, or Energy)
 *   Benediction: Bestow blessing
 *   Divine Devotion: Request blessing or miracle
 *   Divine Incantation: Divine spells
 *   Arcane Incantation: Arcane spells
 *   Arcane Talent: Intrinsic spell-like arcane powers
 *   Spirit Talent: Intrinsic spell-like spirit powers
 *   Alchemy: Create alchemical elixirs or perform actions
 *   Divination: Foretelling the future
 */
export class MysticalAbility
    extends SubTypeMixin(MasteryLevelMixin(SohlItem.BaseLogic))
    implements
        MysticalAbility.Logic,
        SubTypeMixin.Logic,
        MasteryLevelMixin.Logic
{
    declare [kMasteryLevelMixin]: true;
    declare readonly parent: MysticalAbility.Data;
    readonly [kMysticalAbility] = true;
    assocSkill?: SohlItem;
    domain?: SohlItem;
    level!: ValueModifier;
    charges!: {
        value: ValueModifier;
        max: ValueModifier;
    };

    static isA(obj: unknown): obj is MysticalAbility {
        return (
            typeof obj === "object" && obj !== null && kMysticalAbility in obj
        );
    }

    /** @inheritdoc */
    initialize(context: SohlAction.Context): void {
        super.initialize(context);
        if (this.parent.assocSkill) {
            this.assocSkill = this.actor?.allItems.find(
                (it) =>
                    it.type === ITEM_KIND.SKILL &&
                    it.name === this.parent.assocSkill,
            );
        }
        this.charges = {
            value: sohl.CONFIG.ValueModifier({}, { parent: this }).setBase(
                this.parent.charges.value,
            ),
            max: sohl.CONFIG.ValueModifier({}, { parent: this }).setBase(
                this.parent.charges.max,
            ),
        };

        this.level = sohl.CONFIG.ValueModifier({}, { parent: this }).setBase(
            this.parent.levelBase,
        );
    }

    /** @inheritdoc */
    evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace MysticalAbility {
    export interface Logic
        extends MasteryLevelMixin.Logic,
            SubTypeMixin.Logic<MysticalAbilitySubType> {
        readonly parent: Data;
        readonly [kMysticalAbility]: true;
        assocSkill?: SohlItem;
        domain?: SohlItem;
        level: ValueModifier;
        charges: {
            value: ValueModifier;
            max: ValueModifier;
        };
    }

    export interface Data
        extends MasteryLevelMixin.Data,
            SubTypeMixin.Data<MysticalAbilitySubType> {
        readonly [kData]: true;
        assocSkill: string;
        isImprovable: boolean;
        domain: {
            philosophy: string;
            name: string;
        };
        levelBase: number;
        charges: {
            value: number;
            max: number;
        };
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: MysticalAbilitySubType,
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
        MysticalAbilitySubType,
        typeof MysticalAbilitySubTypes
    >(
        MasteryLevelMixin.DataModel(SohlItem.DataModel),
        MysticalAbilitySubTypes,
    ) as unknown as Constructor<MysticalAbility.Data> &
        SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements Data {
        static readonly LOCALIZATION_PREFIXES = ["MysticalAbility"];
        declare abbrev: string;
        declare skillBaseFormula: string;
        declare masteryLevelBase: number;
        declare improveFlag: boolean;
        assocSkill!: string;
        isImprovable!: boolean;
        domain!: {
            philosophy: string;
            name: string;
        };
        levelBase!: number;
        charges!: {
            value: number;
            max: number;
        };
        declare subType: MysticalAbilitySubType;
        readonly [kData] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                assocSkill: new StringField(),
                isImprovable: new BooleanField({ initial: false }),
                domain: new SchemaField({
                    philosophy: new StringField(),
                    name: new StringField(),
                }),
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
                    template: "systems/sohl/templates/item/mysticalability.hbs",
                },
            });
    }
}
